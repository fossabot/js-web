import { ILike, In, Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import {
  getServiceProviderEntityId,
  getServiceProviderCallbackUrl,
  getIdentityProviderEntityId,
} from '@seaccentral/core/dist/sso/saml';
import {
  ExternalAuthProviderType,
  UserAuthProvider,
} from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import { sluggerFilter } from '@seaccentral/core/dist/utils/string';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { UserIdentifiers } from '@seaccentral/core/dist/dto/UserIdentifiers.dto';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { ServiceProviderConfig } from '@seaccentral/core/dist/sso/ServiceProviderConfig.entity';
import { IdentityProviderConfig } from '@seaccentral/core/dist/sso/IdentityProviderConfig.entity';

import { OrganizationBody } from './dto/OrganizationBody.dto';

@Injectable()
export class OrganizationService extends TransactionFor<OrganizationService> {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationUser)
    private organizationUserRepository: Repository<OrganizationUser>,
    @InjectRepository(ServiceProviderConfig)
    private serviceProviderConfigRepository: Repository<ServiceProviderConfig>,
    @InjectRepository(IdentityProviderConfig)
    private identityProviderConfigRepository: Repository<IdentityProviderConfig>,
    @InjectRepository(UserAuthProvider)
    private userAuthProviderRepository: Repository<UserAuthProvider>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async findOrCreate(name: string, isIdentityProvider: boolean) {
    const lowercaseName = name.toLowerCase();
    const existingOrganization = await this.organizationRepository.findOne({
      where: { name: lowercaseName },
    });

    if (existingOrganization) {
      return existingOrganization;
    }

    const newOrganization = this.organizationRepository.create({
      isIdentityProvider,
      name: lowercaseName,
      slug: sluggerFilter(lowercaseName),
    });
    const organization = await this.organizationRepository.save(
      newOrganization,
    );

    return organization;
  }

  async create(name: string) {
    const lowercaseName = name.toLowerCase();
    const existingOrganization = await this.organizationRepository.findOne({
      where: { name: lowercaseName },
    });

    if (existingOrganization) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Organization with this name already exists',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newOrganization = this.organizationRepository.create({
      name: lowercaseName,
      slug: sluggerFilter(lowercaseName),
    });
    const organization = await this.organizationRepository.save(
      newOrganization,
    );

    return organization;
  }

  async list(query: BaseQueryDto) {
    const searchField = query.searchField
      ? { [query.searchField]: ILike(`%${query.search}%`) }
      : {};
    const orderByField = query.orderBy ? { [query.orderBy]: query.order } : {};

    const count = await this.organizationRepository.count(searchField);
    const organizations = await this.organizationRepository.find({
      where: {
        ...searchField,
      },
      skip: query.skip,
      take: query.take,
      order: {
        ...orderByField,
      },
    });

    if (query.id && !organizations.some((org) => org.id === query.id)) {
      const specificOrg = await this.organizationRepository.findOne({
        id: query.id,
      });
      if (specificOrg) {
        organizations.unshift(specificOrg);
      }
    }

    const promises = organizations.map((organization) =>
      this.getSSOConfig(organization),
    );

    const results = await Promise.all(promises);

    const organizationWithSSOConfig = results.map((owsc) => ({
      ...owsc,
      isSSOSetup: !!owsc.sso.idp && !!owsc.sso.sp,
    }));

    return { organizationWithSSOConfig, count };
  }

  async findById(
    id: string,
    fetchSSODetails = true,
  ): Promise<Organization | any> {
    const organization = await this.organizationRepository.findOne(id);
    if (!organization) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Organization not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (fetchSSODetails) {
      return this.getSSOConfig(organization);
    }
    return organization;
  }

  async checkIsExist(id?: string): Promise<boolean> {
    const organization = await this.organizationRepository.findOne(id);

    if (!organization) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Organization not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return true;
  }

  async listUsers(id: string, query: { skip: number; take: number }) {
    const result = await this.organizationUserRepository.find({
      skip: query.skip,
      take: query.take,
      order: {
        createdAt: 'ASC',
      },
      where: {
        organization: { id },
      },
    });

    const organizationUsers = result.map((ou) => ou.user);

    const ouCount = await this.organizationUserRepository.count({
      where: { organization: { id } },
    });

    return { organizationUsers, ouCount };
  }

  async removeUsers(id: string, userIdsBody: UserIdentifiers) {
    const organization = (await this.findById(id, false)) as Organization;

    await this.organizationUserRepository.delete({
      organization,
      user: { id: In(userIdsBody.ids) },
    });
  }

  async getSSOConfig(organization: Organization) {
    if (organization.isIdentityProvider) {
      const idp = await this.identityProviderConfigRepository.findOne({
        where: { organization },
      });

      return {
        ...organization,
        sso: {
          idp,
          sp: {
            callbackUrl: getServiceProviderCallbackUrl(organization.slug),
            issuer: getServiceProviderEntityId(organization.slug),
          },
        },
      };
    }

    if (organization.isServiceProvider) {
      const sp = await this.serviceProviderConfigRepository.findOne({
        where: { organization },
      });

      return {
        ...organization,
        sso: {
          sp,
          idp: {
            issuer: getIdentityProviderEntityId(organization.slug),
          },
        },
      };
    }

    return {
      ...organization,
      sso: {
        sp: undefined,
        idp: undefined,
      },
    };
  }

  async update(id: string, organizationBody: OrganizationBody) {
    const {
      name,
      ssoLoginUrl,
      issuer,
      certificateKey,
      // nameidFormat,
      metadataKey,
      spIssuer,
      spAcsUrl,
      spMetadataKey,
      spCertificateKey,
      isServiceProvider,
      isIdentityProvider,
      showOnlySubscribedCourses,
      disableUpgrade,
    } = organizationBody;
    const organization = await this.organizationRepository.findOne(id);

    if (!organization) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Organization not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const isIDP =
      isIdentityProvider &&
      !!((ssoLoginUrl && issuer && certificateKey) || metadataKey);
    const isSP =
      isServiceProvider &&
      !!((spAcsUrl && spIssuer && spCertificateKey) || spMetadataKey);

    if (isIDP && isSP) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error:
            'Organization can either be service provider or identity provider',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.organizationRepository.save({
      name,
      id: organization.id,
      isIdentityProvider: isIDP,
      isServiceProvider: isSP,
      showOnlySubscribedCourses:
        showOnlySubscribedCourses === undefined
          ? organization.showOnlySubscribedCourses
          : showOnlySubscribedCourses,
      disableUpgrade:
        disableUpgrade === undefined
          ? organization.disableUpgrade
          : disableUpgrade,
    });

    if (isIDP) {
      let identityProviderConfig =
        await this.identityProviderConfigRepository.findOne({
          where: { organization },
        });

      if (!identityProviderConfig) {
        identityProviderConfig = this.identityProviderConfigRepository.create({
          organization,
        });
      }

      identityProviderConfig.ssoLoginUrl =
        organizationBody.ssoLoginUrl || identityProviderConfig.ssoLoginUrl;
      identityProviderConfig.issuer =
        organizationBody.issuer || identityProviderConfig.issuer;
      identityProviderConfig.certificateKey =
        organizationBody.certificateKey ||
        identityProviderConfig.certificateKey;
      identityProviderConfig.metadataKey =
        organizationBody.metadataKey || identityProviderConfig.metadataKey;

      identityProviderConfig.certificateFileName =
        organizationBody.certificateFileName ||
        organizationBody.certificateKey ||
        identityProviderConfig.certificateFileName;
      identityProviderConfig.metadataFileName =
        organizationBody.metadataFileName ||
        organizationBody.metadataKey ||
        identityProviderConfig.metadataFileName;

      // TODO: Make this dynamic
      identityProviderConfig.nameidFormat =
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';

      await this.identityProviderConfigRepository.save(identityProviderConfig);
      await this.setupSSOLoginForOrganizationUsers(organization);

      return;
    } 

    if (isSP) {
      let serviceProviderConfig =
        await this.serviceProviderConfigRepository.findOne({
          where: { organization },
        });

      if (!serviceProviderConfig) {
        serviceProviderConfig = this.serviceProviderConfigRepository.create({
          organization,
        });
      }

      serviceProviderConfig.callbackUrl =
        organizationBody.spAcsUrl || serviceProviderConfig.callbackUrl;
      serviceProviderConfig.issuer =
        organizationBody.spIssuer || serviceProviderConfig.issuer;
      serviceProviderConfig.certificateKey =
        organizationBody.spCertificateKey ||
        serviceProviderConfig.certificateKey;
      serviceProviderConfig.metadataKey =
        organizationBody.spMetadataKey || serviceProviderConfig.metadataKey;

      serviceProviderConfig.certificateFileName =
        organizationBody.spCertificateFileName ||
        organizationBody.spCertificateKey ||
        serviceProviderConfig.certificateFileName;
      serviceProviderConfig.metadataFileName =
        organizationBody.spMetadataFileName ||
        organizationBody.spMetadataKey ||
        serviceProviderConfig.metadataFileName;

      await this.serviceProviderConfigRepository.save(serviceProviderConfig);
    }
  }

  async setupSSOLoginForOrganizationUsers(organization: Organization) {
    try {
      const organizationUsers = await this.organizationUserRepository.find({
        where: { organization },
      });
      const users = organizationUsers.map((ou) => ou.user);

      const userAuthProvidersWithOrganization =
        await this.userAuthProviderRepository.find({
          where: { organization },
        });
      const existingUserIds = userAuthProvidersWithOrganization.map(
        (uap) => uap.user.id,
      );

      const usersToSetup = users.filter((u) => !existingUserIds.includes(u.id));
      if (usersToSetup.length === 0) return;

      const newUserAuthProviders = usersToSetup.map((uts) => {
        const newUserAuthProvider = this.userAuthProviderRepository.create({
          user: uts,
          organization,
          provider: ExternalAuthProviderType.SAMLSSO,
        });

        return newUserAuthProvider;
      });

      await this.userAuthProviderRepository.insert(newUserAuthProviders);
    } catch (error) {
      this.logger.error(
        `Error setting up user auth provider for organization ${organization.id}`,
        error,
      );
    }
  }

  async delete(organizationIdsBody: UserIdentifiers) {
    await this.organizationRepository
      .createQueryBuilder('delete_organization')
      .delete()
      .from(Organization)
      .where('id IN (:...ids)', {
        ids: organizationIdsBody.ids,
      })
      .execute();
  }
}
