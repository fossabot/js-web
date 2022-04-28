import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import addMinutes from 'date-fns/addMinutes';
import faker from 'faker';
import humps from 'humps';
import {
  DeepPartial,
  In,
  InsertResult,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { LoginSetting } from '../admin/Login.setting.entity';
import { PasswordSetting } from '../admin/Password.setting.entity';
import { LocalSignupRequestBody } from '../dto/LocalSignup.dto';
import { SocialSignupRequest } from '../dto/SocialSignupRequest.dto';
import { UserIdentifiers } from '../dto/UserIdentifiers.dto';
import { UserUploadFileDto } from '../dto/UserUploadFile.dto';
import { UserUploadHistoryDto } from '../dto/UserUploadHistory.dto';
import { UserUploadRecordDto } from '../dto/UserUploadRocord.dto';
import { GroupUser } from '../group/GroupUser.entity';
import { Invitation } from '../invitation/Invitation.entity';
import { LanguageCode } from '../language/Language.entity';
import { EmailNotificationSubCategoryKey } from '../notification/enum/EmailNotificationSubCategory.enum';
import { NotificationVariableDict } from '../notification/NotificationVariableDict';
import { Organization } from '../organization/Organization.entity';
import { OrganizationUser } from '../organization/OrganizationUser.entity';
import { NotificationProducer } from '../queue/notification.producer';
import { SYSTEM_ROLES } from '../utils/constants';
import { getRandomHash, hash } from '../utils/crypt';
import { convertExcelBufferToJson } from '../utils/file-helper';
import { retrieveObjectFromS3 } from '../utils/s3';
import { sleep } from '../utils/sleep';
import { TransactionFor } from '../utils/withTransaction';
import { Gender } from './Gender.enum';
import { Role } from './Role.entity';
import { User } from './User.entity';
import {
  AuthProviderType,
  ExternalAuthProviderType,
  UserAuthProvider,
} from './UserAuthProvider.entity';
import { UserRole } from './UserRole.entity';
import { UserSession } from './UserSession.entity';
import { UserTitle } from './userTitle.enum';
import {
  UserUploadHistory,
  UserUploadProcessStatus,
} from './UserUploadHistory.entity';
import { UserUploadType } from './UserUploadType.enum';

@Injectable()
export class UsersService extends TransactionFor<UsersService> {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationProducer: NotificationProducer,
    @InjectRepository(PasswordSetting)
    private passwordSettingRepository: Repository<PasswordSetting>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserAuthProvider)
    private userAuthProviderRepository: Repository<UserAuthProvider>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    @InjectRepository(LoginSetting)
    private loginSettingRepository: Repository<LoginSetting>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(OrganizationUser)
    private organizationUserRepository: Repository<OrganizationUser>,
    @InjectRepository(GroupUser)
    private groupUserRepository: Repository<GroupUser>,
    @InjectRepository(UserUploadHistory)
    private userUploadHistory: Repository<UserUploadHistory>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async getUserUploadHistoryByFileKey(
    key: string,
  ): Promise<UserUploadHistoryDto> {
    const history = await this.userUploadHistory.findOne({
      where: {
        s3key: key,
      },
    });
    if (!history) {
      throw new HttpException(
        'User upload history not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      file: history.file,
    } as UserUploadHistoryDto;
  }

  async getUserUploadHistory(
    skip: number,
    take: number,
    organizationId?: string,
  ): Promise<UserUploadHistoryDto[]> {
    let history: UserUploadHistory[];
    if (organizationId) {
      history = await this.userUploadHistory.find({
        where: {
          organizationId,
        },
        skip,
        take,
        order: {
          createdAt: 'DESC',
        },
      });
    } else {
      history = await this.userUploadHistory.find({
        where: {
          organizationId: null,
        },
        skip,
        take,
        order: {
          createdAt: 'DESC',
        },
      });
    }

    return history as UserUploadHistoryDto[];
  }

  async addUserUploadHistory(
    userUploadFileDto: UserUploadFileDto,
    user: User,
    organizationId?: string,
  ): Promise<boolean> {
    const history = this.userUploadHistory.create({
      file: userUploadFileDto.fileName,
      user,
      organizationId,
      s3key: userUploadFileDto.key,
      uploadType: userUploadFileDto.uploadType,
    });
    await this.userUploadHistory.save(history);
    return true;
  }

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user;
  }

  async getByUsername(username: string) {
    const user = await this.usersRepository.findOne({ where: { username } });

    if (user) {
      return user;
    }

    throw new HttpException(
      'User with this username does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getById(id: string) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'ur')
      .leftJoinAndSelect('ur.role', 'role')
      .where('user.id = :id')
      .andWhere('user.isActive = :isActive')
      .setParameters({ id, isActive: true })
      .getOne();

    if (user) {
      return user;
    }

    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getByUsernameOrEmail(usernameOrEmail: string) {
    const user = await this.usersRepository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      select: ['email', 'username', 'id'],
    });

    if (user) {
      return user;
    }

    throw new HttpException(
      'User with this email or username does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async create(
    localSignupBody: (LocalSignupRequestBody | SocialSignupRequest) & {
      role?: Role;
    },
    extra?: DeepPartial<User>,
  ): Promise<User> {
    try {
      const user = this.usersRepository.create({
        email: localSignupBody.email,
        lastName: localSignupBody.lastName,
        firstName: localSignupBody.firstName,
        emailVerificationKey: uuidv4(),
        emailVerificationRequestDateUTC: new Date(),
        ...extra,
      });

      if (!user.emailVerificationKey) {
        throw new Error("Can't generate email verification key.");
      }

      await this.usersRepository.save(user);

      const defaultRole = await this.roleRepository.findOne({
        where: { name: 'Member' },
      });

      await this.userRoleRepository.save({
        user,
        role: localSignupBody.role || defaultRole,
      });

      this.sendEmailVerificationEmail({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        key: user.emailVerificationKey as string,
      });

      return user;
    } catch (error) {
      // TODO: Figure out generic way to handle errors
      if (error.constraint === 'email_unique_index') {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Email already exists!',
            code: '400_001',
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        this.logger.error(`Error create user: ${JSON.stringify(error)}`);
      }

      throw error;
    }
  }

  async addUserToOrganization(user: User, organization: Organization) {
    const organizationUser = await this.organizationUserRepository.save({
      user,
      organization,
    });

    return organizationUser;
  }

  async createProvider(userAuthProvider: DeepPartial<UserAuthProvider>) {
    const setting = await this.passwordSettingRepository.findOne();
    if (!setting) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Password setting not found!',
          code: '404',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const date = new Date();
    date.setDate(date.getDate() + setting.expireIn);
    userAuthProvider.passwordExpireDate = date.toUTCString();
    const authProvider = await this.userAuthProviderRepository.create(
      userAuthProvider,
    );

    return this.userAuthProviderRepository.save(authProvider);
  }

  async getProviderByUser(user: User, provider: AuthProviderType) {
    return this.userAuthProviderRepository.findOne({
      relations: ['user', 'passwordRecords'],
      where: { provider, user: { id: user.id } },
    });
  }

  async getProviders(user: User) {
    return this.userAuthProviderRepository.find({
      where: { user: { id: user.id } },
    });
  }

  async createProviderByPassword(user: User, password: string) {
    return this.createProvider({
      user,
      provider: 'password',
      hashedPassword: await hash(password),
    });
  }

  async getPasswordAuthProviderByUserId(userId: string) {
    const userAuthProvider = await this.userAuthProviderRepository.findOne({
      where: { userId, provider: 'password' },
    });

    if (userAuthProvider) {
      return userAuthProvider;
    }

    throw new HttpException(
      'No password auth provider linked to this user',
      HttpStatus.NOT_FOUND,
    );
  }

  async updateUserLoginAttempt(userId: string) {
    const user = await this.getById(userId);
    const loginSetting = await this.loginSettingRepository.findOne();
    if (!loginSetting) {
      throw new HttpException(
        'No login setting provided for the system',
        HttpStatus.NOT_FOUND,
      );
    }
    if (user.accessFailedCount >= loginSetting.maxAttempts) {
      return this.lockUser(user.id, loginSetting.lockDuration);
    }

    user.accessFailedCount += 1;
    return this.usersRepository.save(user);
  }

  async resetLoginAttempts(userId: string) {
    await this.usersRepository.update(userId, {
      accessFailedCount: 0,
      lockoutEndDateUTC: null,
    });
  }

  async lockUser(userId: string, lockDuration: number) {
    const lockoutDate = addMinutes(Date.now(), lockDuration);
    this.usersRepository.update(userId, {
      isLockedOut: true,
      lockoutEndDateUTC: lockoutDate,
    });
    throw new HttpException(
      'User has been locked out due to too many login attempts',
      HttpStatus.FORBIDDEN,
    );
  }

  async saveSession(
    refreshToken: string,
    userId: string,
    authProviderType: AuthProviderType,
  ) {
    const userSession = this.userSessionRepository.create({
      refreshToken,
      user: { id: userId },
      provider: authProviderType,
    });

    await this.usersRepository.update(userId, {
      lastLoginDate: new Date(),
    });

    await this.userSessionRepository.save(userSession);
  }

  async getSession(refreshToken: string) {
    const userSession = await this.userSessionRepository.findOne({
      where: { refreshToken, isActive: true },
    });
    if (!userSession) {
      throw new HttpException(
        'Refresh token does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    return userSession;
  }

  async removeRefreshToken(userSession: UserSession) {
    await this.userSessionRepository.delete(userSession.id);
  }

  async getInvitedUserByToken(token: string) {
    return this.invitationRepository.findOneOrFail({
      where: { token, isActive: true },
    });
  }

  async invalidateInvitationToken(token: string) {
    return this.invitationRepository.update(
      { token },
      { isActive: false, acceptedAt: new Date() },
    );
  }

  async populateRoles() {
    const defaultRole = await this.roleRepository.findOne({
      where: { name: 'Admin' },
    });

    if (defaultRole) {
      return;
    }

    const roles = [
      { name: SYSTEM_ROLES.ADMIN },
      { name: SYSTEM_ROLES.CORPORATE_ADMIN },
      { name: SYSTEM_ROLES.MEMBER },
      { name: SYSTEM_ROLES.INSTRUCTOR },
    ];

    await this.roleRepository.insert(roles);
  }

  async createRandomUser() {
    const random = Math.random() * 1000;

    const newUser = await this.usersRepository.create({
      firstName: `Seac ${random}`,
      lastName: `Central ${random}`,
      email: faker.internet.email(),
      gender: Gender.Female,
      title: UserTitle.Mrs,
      isActivated: true,
    });
    await this.usersRepository.save(newUser);

    await this.createProvider({
      user: newUser,
      provider: 'password',
      hashedPassword: await getRandomHash(),
    });

    return newUser;
  }

  async getUserByPasswordResetKey(passwordResetKey: string) {
    return this.usersRepository.findOne({
      passwordResetKey,
    });
  }

  async unsetPasswordResetKey(user: User) {
    user.passwordResetKey = null;
    user.passwordResetRequestDateUTC = null;
    await this.usersRepository.save(user);
  }

  async proceedUploadedUser(key?: string, uploadedFile?: UserUploadHistory) {
    if (key) {
      uploadedFile = await this.userUploadHistory.findOne({
        where: {
          s3key: key,
          isProcessed: false,
          status: UserUploadProcessStatus.PENDING,
        },
      });
    }
    if (!uploadedFile) {
      throw new HttpException(
        'User upload file not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    const createdUserIds = await this.bulkCreateUserByFile(uploadedFile);
    const createdUsers = await this.usersRepository.find({
      where: { id: In(createdUserIds) },
    });
    await this.bulkCreateInvitationAndSendEmail(
      createdUsers,
      uploadedFile.user,
    );
    uploadedFile.isProcessed = true;
    uploadedFile.status = UserUploadProcessStatus.COMPLETED;

    await this.userUploadHistory.save(uploadedFile);
  }

  async proceedOrganizationUploadedUser(
    organization: Organization,
    key: string,
  ) {
    const uploadedFile = await this.userUploadHistory.findOne({
      where: {
        s3key: key,
        organizationId: organization.id,
        isProcessed: false,
        status: UserUploadProcessStatus.PENDING,
      },
    });
    if (!uploadedFile) {
      throw new HttpException(
        'User upload file not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    const createdUserIds = await this.bulkCreateUserByFile(
      uploadedFile,
      organization,
    );
    const createdUsers = await this.usersRepository.find({
      where: { id: In(createdUserIds) },
    });

    await this.bulkCreateOrganizationUser(createdUsers, organization);
    if (organization.isIdentityProvider) {
      await this.bulkCreateUserAuthProvider(createdUsers, organization);
    } else {
      await this.bulkCreateInvitationAndSendEmail(
        createdUsers,
        uploadedFile.user,
        organization,
      );
    }
    uploadedFile.isProcessed = true;
    uploadedFile.status = UserUploadProcessStatus.COMPLETED;

    await this.userUploadHistory.save(uploadedFile);
  }

  async bulkCreateOrganizationUser(
    users: User[],
    organization: Organization,
  ): Promise<InsertResult> {
    return this.organizationUserRepository
      .createQueryBuilder('organization_user')
      .insert()
      .into(OrganizationUser)
      .values(
        users.map((user) => {
          return {
            userId: user.id,
            organization,
          };
        }),
      )
      .onConflict('("userId", "organizationId") DO NOTHING')
      .execute();
  }

  async bulkCreateUserAuthProvider(
    users: User[],
    organization: Organization,
  ): Promise<InsertResult> {
    return this.userAuthProviderRepository
      .createQueryBuilder('user_auth_provider')
      .insert()
      .into(UserAuthProvider)
      .values(
        users.map((user) => {
          return {
            userId: user.id,
            provider: ExternalAuthProviderType.SAMLSSO,
            organization,
          };
        }),
      )
      .onConflict('("userId", "provider") DO NOTHING')
      .execute();
  }

  async bulkCreateUserRole(data: UserUploadRecordDto[]): Promise<any> {
    const users = await this.usersRepository.find({
      where: {
        email: In(data.map((u) => u.email)),
      },
    });
    const defaultRole = await this.roleRepository.findOne({
      where: { name: 'Member' },
    });
    return this.userRoleRepository
      .createQueryBuilder('user_role')
      .insert()
      .into(UserRole)
      .values(
        users.map((user) => {
          return {
            user,
            role: defaultRole,
          };
        }),
      )
      .execute();
  }

  async bulkCreateInvitationAndSendEmail(
    users: User[],
    invitedBy: User,
    organization?: Organization,
  ) {
    const role = await this.roleRepository.findOne({
      where: { name: 'Member' },
    });
    // eslint-disable-next-line no-restricted-syntax
    for (const user of users) {
      try {
        const token = uuidv4();
        const newInvitation = this.invitationRepository.create();
        newInvitation.organization = organization;
        newInvitation.token = token;
        newInvitation.role = role as Role;
        newInvitation.invitedBy = invitedBy;
        newInvitation.firstName = user.firstName as string;
        newInvitation.lastName = user.lastName as string;
        newInvitation.email = user.email as string;
        newInvitation.user = user;
        await this.invitationRepository.save(newInvitation);

        this.sendAccountActivationEmail({ id: user.id, token });

        await sleep(500);
      } catch (e) {
        this.logger.error('Error bulk creating invitation and send email.', e);
      }
    }
  }

  async sendAccountActivationEmail(params: {
    fullName?: string;
    email?: string;
    id?: string;
    token: string;
  }) {
    const user = params.id
      ? await this.usersRepository
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.subscriptions', 'subscriptions')
          .leftJoinAndSelect(
            'subscriptions.subscriptionPlan',
            'subscriptionPlan',
          )
          .where('user.id = :userId', { userId: params.id })
          .getOne()
      : params;

    if (user && user.email) {
      this.notificationProducer.sendEmail({
        key: EmailNotificationSubCategoryKey.MEMBERSHIP_WELCOME,
        language:
          'emailNotificationLanguage' in user
            ? user?.emailNotificationLanguage
            : LanguageCode.EN,
        to: user.email,
        replacements: {
          [NotificationVariableDict.PACKAGE_NAME.alias]:
            'subscriptions' in user
              ? user.subscriptions?.[0]?.subscriptionPlan.name
              : '',
          [NotificationVariableDict.FULL_NAME.alias]: user.fullName,
          [NotificationVariableDict.EMAIL.alias]: user.email,
          [NotificationVariableDict.ACCOUNT_ACTIVATION_LINK
            .alias]: `${this.configService.get(
            'CLIENT_BASE_URL',
          )}/setup-account?token=${params.token}`,
        },
      });
    }
  }

  async bulkCreateUserByFile(
    uploadedFile: UserUploadHistory,
    organization?: Organization,
  ): Promise<string[]> {
    try {
      const buffer = await retrieveObjectFromS3(uploadedFile.s3key);
      let users = (await convertExcelBufferToJson(
        buffer,
      )) as UserUploadRecordDto[];
      users = humps.camelizeKeys(users) as UserUploadRecordDto[];
      const existingUser = await this.usersRepository.find({
        where: { email: In(users.map((u: UserUploadRecordDto) => u.email)) },
      });
      const newUsers = users.filter(
        (user) => !existingUser.map((u) => u.email).includes(user.email),
      );

      let result = null;
      switch (uploadedFile.uploadType) {
        case UserUploadType.Skip:
          result = await this.bulkCreateUserWithSkip(newUsers);
          break;
        case UserUploadType.Update:
          result = await this.bulkCreateUserWithUpdate(
            users,
            newUsers,
            existingUser,
            organization,
          );
          break;
        case UserUploadType.Replace:
          result = await this.bulkCreateUserWithReplace(
            users,
            newUsers,
            existingUser,
            organization,
          );
          break;
        default:
          break;
      }

      await this.bulkCreateUserRole(newUsers);
      if (result) {
        return result.identifiers.map((identifier) => identifier.id);
      }
      return [];
    } catch (e) {
      this.logger.error(
        `Error bulk creating user by file: ${uploadedFile.s3key}.`,
        e,
      );
      return [];
    }
  }

  async bulkCreateUserWithSkip(
    userToInsert: UserUploadRecordDto[],
  ): Promise<InsertResult> {
    return this.usersRepository
      .createQueryBuilder('user')
      .insert()
      .into(User)
      .values(userToInsert)
      .execute();
  }

  async bulkCreateUserWithUpdate(
    users: UserUploadRecordDto[],
    newUsers: UserUploadRecordDto[],
    existingUser: User[],
    organization?: Organization,
  ): Promise<InsertResult> {
    const result = await this.bulkCreateUserWithSkip(newUsers);
    const promises = existingUser.map((user) => {
      const updatedUser = users.find((u) => u.email === user.email);
      if (!updatedUser) {
        return null;
      }
      if (!user.firstName) {
        user.firstName = updatedUser.firstName;
      }
      if (!user.lastName) {
        user.lastName = updatedUser.lastName;
      }
      return this.usersRepository.save(user);
    });

    const updatedUsers = await Promise.all(promises);
    if (organization) {
      const filteredUsers = updatedUsers.filter((u) => u !== null) as User[];
      await this.bulkCreateOrganizationUser(filteredUsers, organization);

      if (organization.isIdentityProvider) {
        await this.bulkCreateUserAuthProvider(filteredUsers, organization);
      }
    }
    return result;
  }

  async bulkCreateUserWithReplace(
    users: UserUploadRecordDto[],
    newUsers: UserUploadRecordDto[],
    existingUser: User[],
    organization?: Organization,
  ): Promise<InsertResult> {
    const result = await this.bulkCreateUserWithSkip(newUsers);
    const promises = existingUser.map((user) => {
      const updatedUser = users.find((u) => u.email === user.email);
      if (!updatedUser) {
        return null;
      }
      user.firstName = updatedUser.firstName;
      user.lastName = updatedUser.lastName;
      user.isActivated = updatedUser.isActivated;
      return this.usersRepository.save(user);
    });

    const updatedUsers = await Promise.all(promises);
    if (organization) {
      const filteredUsers = updatedUsers.filter((u) => u !== null) as User[];
      await this.bulkCreateOrganizationUser(filteredUsers, organization);

      if (organization.isIdentityProvider) {
        await this.bulkCreateUserAuthProvider(filteredUsers, organization);
      }
    }
    return result;
  }

  async deactivateUsers(userIdsBody: UserIdentifiers, user: User) {
    const userIds = userIdsBody.ids.filter((id) => id !== user.id);

    if (!userIds.length) {
      return;
    }

    await this.userSessionRepository
      .createQueryBuilder('userSession')
      .delete()
      .from(UserSession)
      .where('userId IN (:...ids)', {
        ids: userIds,
      })
      .execute();

    const users = await this.usersRepository.find({
      where: { id: In(userIds), isActive: true },
    });

    users.forEach((u) => {
      u.isActivated = false;
    });

    await this.usersRepository.save(users);
  }

  async activateUsers(userIdsBody: UserIdentifiers) {
    const users = await this.usersRepository.find({
      where: { id: In(userIdsBody.ids), isActive: true },
    });

    users.forEach((user) => {
      user.isActivated = true;
    });

    await this.usersRepository.save(users);
  }

  async updateUserRole(userId: string, roleId: string, assignerId: string) {
    if (assignerId === userId)
      throw new HttpException(
        "Can't change role of yourself.",
        HttpStatus.BAD_REQUEST,
      );

    const user = await this.usersRepository.findOne({
      id: userId,
      isActive: true,
    });
    if (!user)
      throw new HttpException('User not exist.', HttpStatus.BAD_REQUEST);

    const role = await this.roleRepository.findOne({
      id: roleId,
      isActive: true,
    });
    if (!role)
      throw new HttpException('Role not exist.', HttpStatus.BAD_REQUEST);

    // Clear exist user-roles, and re-insert. (We use single role per user for now).
    await this.userRoleRepository.delete({ user });
    return this.userRoleRepository.save({
      user,
      role,
      isActive: true,
      isDefault: true,
    });
  }

  async updateSeacIdByEmail(email: string, seacId: string) {
    return this.usersRepository.update({ email }, { seacId });
  }

  async checkCanUpgradePlan(user: User) {
    // https://github.com/typeorm/typeorm/issues/4396#issuecomment-566254087
    // apparently you can't use where clause on relationships except for PKs
    // but it works for string conditions like in the query builder

    const orgUser = await this.organizationUserRepository.findOne({
      join: {
        alias: 'orgUser',
        innerJoin: { organization: 'orgUser.organization' },
      },
      where: (qb: SelectQueryBuilder<OrganizationUser>) => {
        qb.where({
          userId: user.id,
        }).andWhere('organization.disableUpgrade = :disableUpgrade', {
          disableUpgrade: true,
        });
      },
    });

    if (orgUser) return false;

    const groupUser = await this.groupUserRepository.findOne({
      join: {
        alias: 'groupUser',
        innerJoin: { group: 'groupUser.group' },
      },
      where: (qb: SelectQueryBuilder<GroupUser>) => {
        qb.where({
          userId: user.id,
        }).andWhere('group.disableUpgrade = :disableUpgrade', {
          disableUpgrade: true,
        });
      },
    });

    if (groupUser) return false;

    return true;
  }

  async sendEmailVerificationEmail(params: {
    fullName?: string;
    email?: string;
    id?: string;
    key: string;
  }) {
    const user = params.id
      ? await this.usersRepository
          .createQueryBuilder('user')
          .where('user.id = :userId', { userId: params.id })
          .select([
            'user.id',
            'user.firstName',
            'user.lastName',
            'user.email',
            'user.emailNotificationLanguage',
          ])
          .getOne()
      : params;

    if (params.key && user && user.email) {
      this.notificationProducer.sendEmail({
        key: EmailNotificationSubCategoryKey.MEMBERSHIP_VERIFY_EMAIL,
        language:
          'emailNotificationLanguage' in user
            ? user?.emailNotificationLanguage
            : LanguageCode.EN,
        to: user.email,
        replacements: {
          [NotificationVariableDict.FULL_NAME.alias]: user.fullName,
          [NotificationVariableDict.ACCOUNT_ACTIVATION_LINK
            .alias]: `${this.configService.get(
            'CLIENT_BASE_URL',
          )}/confirm-email?key=${params.key}`,
        },
      });
    }
  }

  async confirmEmail(key: string) {
    if (!key.trim())
      throw new HttpException(
        'Verification key should not be nulled.',
        HttpStatus.BAD_REQUEST,
      );

    const user = await this.usersRepository.findOne({
      emailVerificationKey: key,
      isActive: true,
    });

    if (!user) throw new HttpException('User not found.', HttpStatus.NOT_FOUND);

    user.isEmailConfirmed = true;
    user.emailVerificationKey = null;
    user.emailVerificationRequestDateUTC = null;
    await this.usersRepository.save(user);

    return true;
  }
}
