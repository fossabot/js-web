import { User } from '@seaccentral/core/dist/user/User.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { AgeRange } from '@seaccentral/core/dist/user/Range.entity';
import { Industry } from '@seaccentral/core/dist/user/Industry.entity';
import { GroupUser } from '@seaccentral/core/dist/group/GroupUser.entity';
import { Group } from '@seaccentral/core/dist/group/Group.entity';
import { pick, pickBy, get, isEmpty, identity, omit } from 'lodash';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@seaccentral/core/dist/user/UserRole.entity';
import { Role } from '@seaccentral/core/dist/user/Role.entity';
import { Migratable } from '../utils/migratable';
import { TR01_User } from '../instancy/TR001_User';
import {
  email,
  gender,
  industry,
  isActive,
  phoneNumber,
  prefix,
} from './userTransformer';
import { Batch } from '../utils/batch';

export class UserMigrationService
  extends TransactionFor<UserMigrationService>
  implements Migratable<TR01_User>
{
  private industries: Industry[] = [];

  private ageRanges: AgeRange[] = [];

  private memberRole: Role;

  private deidentify = false;

  private userBatch = new Batch(1000, (entries) =>
    this.userRepository.save(entries),
  );

  private userRoleBatch = new Batch(1000, (entries) =>
    this.userRoleRepository.save(entries),
  );

  constructor(
    moduleRef: ModuleRef,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AgeRange)
    private readonly ageRangeRepository: Repository<AgeRange>,
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
    @InjectRepository(GroupUser)
    private readonly groupUserRepository: Repository<GroupUser>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly configSerivce: ConfigService,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    super(moduleRef);
    this.deidentify = this.configSerivce.get<string>('DEIDENTIFY') === 'true';
  }

  async setup() {
    const [ageRanges, industries, memberRole] = await Promise.all([
      this.ageRangeRepository.find(),
      this.industryRepository.find(),
      this.roleRepository.findOneOrFail({ name: 'Member' }),
    ]);
    this.ageRanges = ageRanges;
    this.industries = industries;
    this.memberRole = memberRole;
  }

  async migrate(instancyUser: TR01_User) {
    const ourUser = await this.userRepository.findOne({
      email: email(instancyUser, this.deidentify),
    });

    if (ourUser) {
      await this.updateUser(instancyUser, ourUser);
      return;
    }
    await this.createUser(instancyUser);
  }

  async done() {
    await Promise.all([this.userBatch.flush(), this.userRoleBatch.flush()]);
  }

  async transformToUser(instancyUser: TR01_User): Promise<User> {
    const group = await this.groupRepository.findOne({
      instancyId: instancyUser.group_id,
    });
    const output: User = this.userRepository.create({
      title: prefix(instancyUser),
      firstName: instancyUser.first_name,
      lastName: instancyUser.last_name,
      email: email(instancyUser, this.deidentify),
      phoneNumber: phoneNumber(instancyUser, this.deidentify),
      ageRangeId: this.ageRanges.find(
        (range) => range.nameEn === instancyUser.age_range,
      )?.id,
      jobTitle: instancyUser.current_job_title,
      industryId: industry(instancyUser, this.industries)?.id,
      skillsToImprove: instancyUser.skills_to_improve,
      companyName: instancyUser.company_name,
      department: instancyUser.department,
      gender: gender(instancyUser),
      isActive: isActive(instancyUser),
      isInstancy: true,
      userRoles: this.userRoleRepository.create([{ role: this.memberRole }]),
      groupUser: group
        ? this.groupUserRepository.create([{ group }])
        : undefined,
    });

    // https://oozou.slack.com/archives/C01JTE2BTJS/p1630903409009900
    if (output.phoneNumber !== null) {
      const existingPhoneNumber = await this.userRepository.count({
        phoneNumber: output.phoneNumber,
      });
      const inBatch = this.userBatch
        .getEntries()
        .find((entry) => entry.phoneNumber === output.phoneNumber);
      if (existingPhoneNumber > 0 || inBatch) {
        output.phoneNumber = null;
      }
    }

    return output;
  }

  async createUser(instancyUser: TR01_User) {
    const user2migrate = await this.transformToUser(instancyUser);
    await this.userBatch.add({
      ...user2migrate,
      ctx: { instancyGroupId: instancyUser.group_id },
    });
  }

  async updateUser(instancyUser: TR01_User, ourUser: User) {
    const group = await this.groupRepository.findOne({
      instancyId: instancyUser.group_id,
    });
    if (group) {
      const userAlreadyInGroup = await this.groupUserRepository.findOne({
        group,
        user: ourUser,
      });
      if (!userAlreadyInGroup) {
        await this.addToGroup(instancyUser, ourUser.id);
      }
    }

    await Promise.all([
      this.updateMissingUserFields(instancyUser, ourUser),
      this.updateUserRole(ourUser, this.memberRole),
    ]);
  }

  async updateUserRole(user: User, role: Role) {
    const count = await this.userRoleRepository.count({ user });
    if (count <= 0) {
      await this.userRoleBatch.add({ user, role });
    }
  }

  /**
   * This update missing fields from ourUser using instancyUser data.
   * Merge instancy user and our user null fields.
   * InstancyUser --transform--> ourUserFieldsValue --update ourUser's null fields--> ourUser.
   */
  async updateMissingUserFields(instancyUser: TR01_User, ourUser: User) {
    const updatableFields = [
      'title',
      'firstName',
      'lastName',
      'phoneNumber',
      'ageRangeId',
      'jobTitle',
      'industryId',
      'skillsToImprove',
      'companyName',
      'department',
      'gender',
    ];
    const payload = await this.transformToUser(instancyUser);
    const nullUserFields = updatableFields.filter(
      (key) => get(ourUser, key) === null,
    );
    const userMissingFieldsPayload = pick(payload, nullUserFields);
    const userMissingDefinedFieldsPayload = pickBy(
      userMissingFieldsPayload,
      identity,
    );
    if (isEmpty(userMissingDefinedFieldsPayload)) {
      return;
    }

    await this.userBatch.add({
      ...omit(ourUser, ['ageRange', 'industry']),
      ...userMissingDefinedFieldsPayload,
    });
  }

  async addToGroup(instancyUser: TR01_User, ourUserId: string) {
    const ourGroup = await this.groupRepository.findOneOrFail({
      instancyId: instancyUser.group_id,
    });
    const result = await this.groupUserRepository.insert({
      group: ourGroup,
      user: { id: ourUserId },
    });

    return result;
  }
}
