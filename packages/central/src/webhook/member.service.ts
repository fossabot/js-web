import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { District } from '@seaccentral/core/dist/address/District.entity';
import { Province } from '@seaccentral/core/dist/address/Province.entity';
import { Subdistrict } from '@seaccentral/core/dist/address/Subdistrict.entity';
import placeholderGroupCompany from '@seaccentral/core/dist/crm/crm.constant';
import { Invitation } from '@seaccentral/core/dist/invitation/Invitation.entity';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { Role } from '@seaccentral/core/dist/user/Role.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import {
  ExternalAuthProviderType,
  UserAuthProvider,
} from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import { PendingMember } from '@seaccentral/core/dist/user/PendingMember.entity';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { UserTaxInvoice } from '@seaccentral/core/dist/user/UserTaxInvoice.entity';
import { UserThirdParty } from '@seaccentral/core/dist/user/UserThirdParty.entity';
import { UserThirdPartyType } from '@seaccentral/core/dist/user/UserThirdPartyType.enum';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { isBefore, isAfter } from 'date-fns';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { GroupService } from '../group/group.service';
import { MemberResponseDto } from './dto/MemberResponse.dto';
import { NewMemberDto } from './dto/NewMember.dto';
import { UpdateMemberDto } from './dto/UpdateMember.dto';
import { UpdateProfileDto } from './dto/UpdateProfile.dto';
import { UpdateTaxInvoiceDto } from './dto/UpdateTaxInvoice.dto';

@Injectable()
export class MemberService extends TransactionFor<MemberService> {
  private readonly logger = new Logger(MemberService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly groupService: GroupService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserAuthProvider)
    private userAuthProviderRepository: Repository<UserAuthProvider>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(UserThirdParty)
    private userThirdPartyRepository: Repository<UserThirdParty>,
    @InjectRepository(OrganizationUser)
    private organizationUserRepository: Repository<OrganizationUser>,
    @InjectRepository(UserTaxInvoice)
    private userTaxInvoiceRepository: Repository<UserTaxInvoice>,
    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,
    @InjectRepository(District)
    private districtRepository: Repository<District>,
    @InjectRepository(Subdistrict)
    private subdistrictRepository: Repository<Subdistrict>,
    @InjectRepository(PendingMember)
    private pendingMemberRepository: Repository<PendingMember>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async create(member: NewMemberDto): Promise<MemberResponseDto> {
    try {
      await this.checkCreateCriteria(member);
      const user = await this.createUser(member);
      await this.createUser3rdParty(user, member);
      const organization = member.OrganizationID
        ? await this.assignOrganization(user, member)
        : undefined;

      await this.assignSubscription(user, member, organization);

      if (isBefore(new Date(member.StartPackage), new Date())) {
        await this.activateMember(user, organization);
      } else {
        await this.pendingMemberRepository.save({
          user,
          organization,
          activationDate: member.StartPackage,
        });
      }

      return {
        MemberId: user.id,
        CustomerID: member.SEACID,
        Status: 'Create new member completed',
        MemberCreate: user.createdAt.toISOString(),
      };
    } catch (e) {
      this.logger.error('Error creating user via webhook', e);
      throw e;
    }
  }

  async update(member: UpdateMemberDto): Promise<MemberResponseDto> {
    try {
      const user3rdParty = await this.updateUser3rdParty(member);
      const user = await this.usersRepository.findOne(user3rdParty.userId);
      if (!user) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'User does not exists!',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      let organization;

      if (
        member.OrganizationID &&
        member.OrganizationID !== placeholderGroupCompany
      ) {
        organization = await this.organizationRepository.findOne({
          id: member.OrganizationID,
        });

        if (!organization) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: 'Organization does not exists!',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        const organizationUser = await this.organizationUserRepository.findOne({
          organization,
          user,
        });

        if (!organizationUser) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: 'User does not belong to this GroupCompany!',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      if (isBefore(new Date(member.StartPackage), new Date())) {
        await this.activateMember(user, organization);
      } else {
        await this.pendingMemberRepository.update(
          { userId: user.id },
          {
            organization,
            activationDate: new Date(member.StartPackage),
          },
        );
      }

      if (member.Method === 0) {
        // assign new subscriptionPlan to existing user
        await this.assignSubscription(user, member, organization);
      } else if (member.Method === 1) {
        // extend subscription period
        const subscriptionPlan = await this.subscriptionPlanRepository.findOne({
          where: { productId: member.SkuCode, isActive: true, isPublic: true },
        });
        if (!subscriptionPlan) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: 'Subscription plan does not exists!',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const searchParams: Partial<Subscription> = {
          user,
          subscriptionPlan,
          isActive: true,
        };

        if (organization) {
          searchParams.organization = organization;
        }

        const existingSubscription = await this.subscriptionRepository.findOne({
          where: searchParams,
        });
        if (
          !existingSubscription ||
          (!!existingSubscription.organizationId && !organization)
        ) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: 'Subscription does not exists!',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        existingSubscription.isActive = false;
        await this.subscriptionRepository.save(existingSubscription);

        const subscription = this.subscriptionRepository.create({
          user,
          organization,
          subscriptionPlan,
          features: existingSubscription.features,
          instancyUserId: existingSubscription.instancyUserId,
        });

        if (organization) {
          subscription.organization = organization;
        }

        subscription.startDate = new Date(member.StartPackage);
        subscription.endDate = new Date(member.EndPackage);

        await this.subscriptionRepository.save(subscription);
      }

      return {
        MemberId: user.id,
        CustomerID: member.SEACID,
        Status: 'Update member completed',
        MemberUpdate: user3rdParty.updatedAt.toISOString(),
      };
    } catch (e) {
      this.logger.error('Error updating user via webhook', e);
      throw e;
    }
  }

  // remove this then have transaction
  async checkCreateCriteria(member: NewMemberDto) {
    await this.checkUserExist(member.Email, member.Phone);
    await this.checkInviationExist(member.Email as string);
    const exist = await this.userThirdPartyRepository.findOne({
      where: {
        userThirdPartyId: member.SEACID,
      },
    });
    if (exist) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'User with this SEACID is already exists!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (member.OrganizationID === placeholderGroupCompany) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error:
            'This GroupCompany is only used for retail customers. Please use UUID associated to an actual organization.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (member.OrganizationID) {
      const organization = await this.organizationRepository.findOne(
        member.OrganizationID,
      );
      if (!organization) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Organization does not exists!',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const subscriptionPlan = await this.subscriptionPlanRepository.findOne({
      where: {
        productId: member.SkuCode,
      },
    });

    if (!subscriptionPlan) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Subscription plan does not exists!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async assignOrganization(
    user: User,
    member: NewMemberDto,
  ): Promise<Organization> {
    try {
      const organization = await this.organizationRepository.findOne(
        member.OrganizationID,
      );
      if (!organization) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Organization does not exists!',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.organizationUserRepository.save({
        user,
        organization,
      });

      return organization;
    } catch (e) {
      this.logger.error('Error assigining organization to user', e);
      throw e;
    }
  }

  async assignSubscription(
    user: User,
    member: NewMemberDto | UpdateMemberDto,
    organization: Organization | undefined,
  ) {
    try {
      const subscriptionPlan = await this.subscriptionPlanRepository.findOne({
        where: {
          productId: member.SkuCode,
          isActive: true,
          isPublic: true,
        },
      });

      if (!subscriptionPlan) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Subscription plan does not exists!',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const searchParams: any = { user, subscriptionPlan, isActive: true };
      if (organization) {
        searchParams.organization = organization;
      }

      const existingSubscription = await this.subscriptionRepository.findOne({
        where: searchParams,
      });

      if (existingSubscription) {
        existingSubscription.isActive = false;
        await this.subscriptionRepository.save(existingSubscription);
      }

      const subscription = this.subscriptionRepository.create({
        startDate: member.StartPackage,
        endDate: member.EndPackage,
        subscriptionPlan,
        user,
        features: existingSubscription?.features,
        instancyUserId: existingSubscription?.instancyUserId,
      });

      if (organization) {
        subscription.organization = organization;
      }

      await this.subscriptionRepository.save(subscription);
      return { subscription, subscriptionPlan };
    } catch (e) {
      this.logger.error('Error assigning subscription to user', e);
      throw e;
    }
  }

  async sendInvitation(user: User, staleable: boolean) {
    try {
      await this.checkInviationExist(user.email as string);
      const token = uuidv4();
      const role = await this.roleRepository.findOne({
        where: { name: 'Member' },
      });
      const newInvitation = this.invitationRepository.create({
        role,
        token,
        email: user.email as string,
        lastName: user.lastName as string,
        firstName: user.firstName as string,
        user: staleable ? undefined : user,
      });
      await this.invitationRepository.save(newInvitation);

      this.usersService.sendAccountActivationEmail({
        id: user.id,
        token,
      });
    } catch (e) {
      this.logger.error('Error sending user invitation', e);
      throw e;
    }
  }

  async createUser(member: NewMemberDto): Promise<User> {
    try {
      await this.checkUserExist(member.Email, member.Phone);
      return this.usersService.create(
        {
          email: member.Email,
          lastName: member.Lastname,
          firstName: member.Name,
        },
        { phoneNumber: member.Phone, seacId: member.SEACID },
      );
    } catch (e) {
      this.logger.error('Error creating user', e);
      throw e;
    }
  }

  async createUser3rdParty(user: User, member: NewMemberDto) {
    try {
      const exist = await this.userThirdPartyRepository.findOne({
        where: {
          userThirdPartyId: member.SEACID,
        },
      });
      if (exist) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'User with this customerID is already exists!',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const user3rdParty = await this.userThirdPartyRepository.create({
        userThirdPartyId: member.SEACID,
        userThirdPartyType: UserThirdPartyType.CRM,
        additionalDetail: {
          memberType: member.MemberType,
          batchName: member.BatchName,
          department: member.Department,
          dealId: member.DealId,
          invoiceNumber: member.InvoiceNumber,
          amendmentStatus: member.AmendmentStatus,
          company: member.Company,
          saleOrderId: member.SaleOrderID,
        },
        user,
      });
      await this.userThirdPartyRepository.save(user3rdParty);
      if (member.UserGroupID) {
        await this.groupService.addUser(
          member.UserGroupID,
          user3rdParty.userId,
        );
      }
    } catch (e) {
      this.logger.error('Error creating user 3rd party', e);
      throw e;
    }
  }

  async updateUser3rdParty(member: UpdateMemberDto): Promise<UserThirdParty> {
    try {
      const user3rdParty = await this.userThirdPartyRepository.findOne({
        where: {
          userThirdPartyId: member.SEACID,
          userThirdPartyType: UserThirdPartyType.CRM,
        },
      });
      if (!user3rdParty) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'User does not exists!',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      user3rdParty.userThirdPartyId = member.SEACID;

      const additionalDetail = user3rdParty.additionalDetail || {};

      additionalDetail.amendmentStatus = member.AmendmentStatus;
      additionalDetail.company = member.Company;
      additionalDetail.department = member.Department;
      additionalDetail.dealId = member.DealId;
      additionalDetail.invoiceNumber = member.InvoiceNumber;
      additionalDetail.batchName = member.BatchName;
      user3rdParty.additionalDetail = additionalDetail;

      await this.userThirdPartyRepository.save(user3rdParty);
      if (member.UserGroupID) {
        await this.groupService.addUser(
          member.UserGroupID,
          user3rdParty.userId,
        );
      }
      return user3rdParty;
    } catch (e) {
      this.logger.error('Error updating user 3rd party', e);
      throw e;
    }
  }

  async checkUserExist(email: string, phoneNumber: string) {
    try {
      let user;
      if (phoneNumber !== '') {
        user = await this.usersRepository.findOne({
          where: [{ email }, { phoneNumber }],
        });
      } else {
        user = await this.usersRepository.findOne({
          where: {
            email,
          },
        });
      }
      if (user) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'User with this email, phone-number already exists!',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (e) {
      throw e;
    }
  }

  async checkInviationExist(email: string) {
    try {
      const invitation = await this.invitationRepository.findOne({
        where: { email },
      });
      if (invitation) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'User with this email is already invited!',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (e) {
      throw e;
    }
  }

  async updateProfile(seacId: string, updateProfileDto: UpdateProfileDto) {
    return this.usersRepository.update({ seacId }, updateProfileDto);
  }

  async updateUserTaxInvoice(
    seacId: string,
    updateTaxAddressDto: UpdateTaxInvoiceDto,
  ) {
    const user = await this.usersRepository.findOne({ seacId });
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'user not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const taxInvoice = await this.userTaxInvoiceRepository.findOne({
      user,
      isDefault: true,
    });
    const province = await this.provinceRepository.findOne({
      provinceCode: updateTaxAddressDto.provinceCode,
    });
    const district = await this.districtRepository.findOne({
      districtCode: updateTaxAddressDto.districtCode,
    });
    const subdistrict = await this.subdistrictRepository.findOne({
      subdistrictCode: updateTaxAddressDto.subdistrictCode,
    });
    const result = await this.userTaxInvoiceRepository.save<
      Partial<UserTaxInvoice>
    >({
      id: taxInvoice?.id,
      ...updateTaxAddressDto,
      province,
      district,
      subdistrict,
      zipCode: updateTaxAddressDto.postalCode,
      country: updateTaxAddressDto.country || 'TH',
      isDefault: true,
      user,
    });

    return result;
  }

  async activateMember(user: User, organization?: Organization | null) {
    if (organization?.isIdentityProvider) {
      const uap = this.userAuthProviderRepository.create({
        userId: user.id,
        provider: ExternalAuthProviderType.SAMLSSO,
        organization,
      });

      await this.userAuthProviderRepository.save(uap);
    } else {
      await this.sendInvitation(user, true);
    }
    await this.pendingMemberRepository.delete({ userId: user.id });
  }
}
