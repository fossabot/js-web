import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { Role } from '@seaccentral/core/dist/user/Role.entity';
import { UserRole } from '@seaccentral/core/dist/user/UserRole.entity';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { UserSession } from '@seaccentral/core/dist/user/UserSession.entity';
import { LoginSetting } from '@seaccentral/core/dist/admin/Login.setting.entity';
import { Invitation } from '@seaccentral/core/dist/invitation/Invitation.entity';
import { UserAuthProvider } from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { ServiceProviderConfig } from '@seaccentral/core/dist/sso/ServiceProviderConfig.entity';
import { IdentityProviderConfig } from '@seaccentral/core/dist/sso/IdentityProviderConfig.entity';

import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    UsersModule,
    OrganizationModule,
    TypeOrmModule.forFeature([
      User,
      Role,
      Organization,
      OrganizationUser,
      Invitation,
      UserAuthProvider,
      UserSession,
      LoginSetting,
      UserRole,
      ServiceProviderConfig,
      IdentityProviderConfig,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME_IN_SECONDS')}s`,
        },
      }),
    }),
  ],
  providers: [InvitationService],
  controllers: [InvitationController],
})
export class InvitationModule {}
