import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseAccessCheckerService } from '@seaccentral/core/dist/course/courseAccessCheckerService.service';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { ERROR_CODES } from '@seaccentral/core/dist/error/errors';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { IdentityProviderConfig } from '@seaccentral/core/dist/sso/IdentityProviderConfig.entity';
import {
  getIdentityProviderByMetadata,
  getIdentityProviderByParams,
  getLocalIdentityProvider,
  getLocalServiceProvider,
  getServiceProviderByMetadata,
  getServiceProviderByParams,
} from '@seaccentral/core/dist/sso/saml';
import { ServiceProviderConfig } from '@seaccentral/core/dist/sso/ServiceProviderConfig.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import {
  ExternalAuthProviderType,
  UserAuthProvider,
} from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { retrieveObjectFromS3 } from '@seaccentral/core/dist/utils/s3';
import { encode } from 'querystring';
import { Repository } from 'typeorm';

@Injectable()
export class SSOService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly courseAccessCheckerService: CourseAccessCheckerService,

    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationUser)
    private organizationUserRepository: Repository<OrganizationUser>,
    @InjectRepository(UserAuthProvider)
    private userAuthProviderRepository: Repository<UserAuthProvider>,
    @InjectRepository(IdentityProviderConfig)
    private identityProviderConfigRepository: Repository<IdentityProviderConfig>,
    @InjectRepository(ServiceProviderConfig)
    private serviceProviderConfigRepository: Repository<ServiceProviderConfig>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(CourseOutline)
    private courseOutlineRepository: Repository<CourseOutline>,
  ) {}

  // Get config for SEAC as Service Provider
  public async getSPIDP(organizationSlug: string) {
    const sp = getLocalServiceProvider(organizationSlug);

    const organization = await this.organizationRepository.findOne({
      where: { slug: organizationSlug },
    });

    if (!organization) {
      throw new HttpException(
        'Invalid organization callback',
        HttpStatus.BAD_REQUEST,
      );
    }

    const idpConfig = await this.identityProviderConfigRepository.findOne({
      where: { organization },
    });

    if (!idpConfig || (!idpConfig.metadataKey && !idpConfig.certificateKey)) {
      throw new HttpException(
        'Identity provider is not setup for the organization',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (idpConfig.metadataKey) {
      const metadata = await retrieveObjectFromS3(idpConfig.metadataKey);

      if (metadata) {
        const idp = getIdentityProviderByMetadata(metadata);
        return { idp, sp, organization };
      }
    } else if (idpConfig.certificateKey) {
      const certificate = await retrieveObjectFromS3(idpConfig.certificateKey);

      if (certificate) {
        const idp = getIdentityProviderByParams({
          issuer: idpConfig.issuer,
          ssoLoginUrl: idpConfig.ssoLoginUrl,
          certificate,
        });

        return { idp, sp, organization };
      }
    }

    throw new HttpException(
      'Cannot get Identity Provider files',
      HttpStatus.BAD_REQUEST,
    );
  }

  // Get config for SEAC as Identity Provider
  public async getIDPSP(
    organizationSlug: string,
    customSPCallbackURL?: string,
  ) {
    const organization = await this.organizationRepository.findOne({
      where: { slug: organizationSlug },
    });

    if (!organization) {
      throw new HttpException(
        'Invalid organization callback',
        HttpStatus.BAD_REQUEST,
      );
    }

    const spConfig = await this.serviceProviderConfigRepository.findOne({
      where: { organization },
    });

    const idp = await getLocalIdentityProvider(
      organizationSlug,
      this.configService.get('SEAC_SAML_IDP_PRIVATE_KEY_KEY') || '',
      this.configService.get('SEAC_SAML_IDP_SIGNING_CERT_KEY') || '',
    );

    if (
      !spConfig ||
      (!spConfig.metadataKey &&
        !(spConfig.certificateKey || spConfig.callbackUrl))
    ) {
      throw new HttpException(
        'Service provider is not setup for the organization',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (spConfig.metadataKey && !customSPCallbackURL) {
      const metadata = await retrieveObjectFromS3(spConfig.metadataKey);

      if (metadata) {
        const sp = getServiceProviderByMetadata(metadata);
        return { idp, sp, organization };
      }
    } else if (spConfig.certificateKey || spConfig.callbackUrl) {
      const certificate = spConfig.certificateKey
        ? await retrieveObjectFromS3(spConfig.certificateKey)
        : null;

      const sp = getServiceProviderByParams({
        certificate,
        issuer: spConfig.issuer,
        callbackUrl: customSPCallbackURL || spConfig.callbackUrl,
        // TODO: Support this field.
        wantAssertionsSigned: false,
      });

      return { idp, sp, organization };
    }

    throw new HttpException(
      'Cannot get Service Provider files',
      HttpStatus.BAD_REQUEST,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async extractEmailFromSAMLSSOResponse(samlResponse: any) {
    // TODO: Generalize
    const email = samlResponse.extract
      ? (samlResponse.extract.attributes[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
        ] as string)
      : null;

    if (!email) {
      throw new HttpException(
        'Email not provided by Identity Provider',
        HttpStatus.BAD_REQUEST,
      );
    }

    return email;
  }

  public async getLoginCredentialForSAMLSSO(
    email: string,
    organization: Organization,
  ) {
    const user = await this.usersService.getByEmail(email);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const userAuthProvider = await this.userAuthProviderRepository.findOne({
      where: { user },
    });

    if (
      !userAuthProvider ||
      userAuthProvider.provider !== ExternalAuthProviderType.SAMLSSO
    ) {
      throw new HttpException(
        'User provider is not setup',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const organizationUser = await this.organizationUserRepository.findOne({
      where: { organization, user },
    });

    if (!organizationUser) {
      throw new HttpException(
        'User does not exist in the organization',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = this.generateToken(user, 30, {
      provider: userAuthProvider.provider,
    });

    return {
      token,
    };
  }

  async getPlanProvider(planId: string) {
    const subscriptionPlan = await this.subscriptionPlanRepository.findOne(
      planId,
    );

    if (!subscriptionPlan || !subscriptionPlan.externalProvider) {
      throw new HttpException(
        'Provider is not setup for this plan',
        HttpStatus.BAD_REQUEST,
      );
    }

    return subscriptionPlan.externalProvider;
  }

  generateSAMLSSOSuccessRedirectUrl(token: string) {
    const response = {
      token,
      flow: 'samlSSO',
    };

    return `${this.configService.get('CLIENT_BASE_URL')}/dashboard/?${encode(
      response,
    )}`;
  }

  private generateToken(user: User, timeInSeconds = 10, extras = {}) {
    const payload = { userId: user.id, generatedAt: new Date(), ...extras };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: `${timeInSeconds}s`,
    });

    return token;
  }

  async hasAccessToLinkedCourses(user: User, organization: Organization) {
    const linkedOutlines = await this.courseOutlineRepository.find({
      where: { organizationProvider: organization },
    });

    if (linkedOutlines.length === 0) return;
    const outlineIds = linkedOutlines.map((outline) => outline.id);

    const atLeastOneSubscription = await this.courseAccessCheckerService
      .getCourseBundleSubscriptionPlanBuilder(user, outlineIds)
      .getOne();

    if (atLeastOneSubscription) return;

    const cheapestPlan = await this.courseAccessCheckerService.getCheapestPlan(
      outlineIds,
    );

    if (!cheapestPlan) return;

    // Check if there's any direct access given to the user.
    const coursesIds = [...new Set(linkedOutlines.map((lo) => lo.courseId))];
    const hasDirectAccess = await Promise.all(
      coursesIds.map((cid) =>
        this.courseAccessCheckerService
          .hasDirectAccess(cid, user.id)
          .catch((error) => {
            // Silence error for now
          }),
      ),
    );

    if (hasDirectAccess.some((access) => !!access)) return;

    const canUpgrade = await this.usersService.checkCanUpgradePlan(user);

    throw new ForbiddenException({
      ...ERROR_CODES.INVALID_SUBSCRIPTION,
      data: {
        cheapestPlan: null,
        canUpgrade,
      },
    });
  }
}
