import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Role } from '@seaccentral/core/dist/user/Role.entity';
import { UserRole } from '@seaccentral/core/dist/user/UserRole.entity';
import { UserSession } from '@seaccentral/core/dist/user/UserSession.entity';
import { LoginSetting } from '@seaccentral/core/dist/admin/Login.setting.entity';
import { Invitation } from '@seaccentral/core/dist/invitation/Invitation.entity';
import { UserAuthProvider } from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { ServiceProviderConfig } from '@seaccentral/core/dist/sso/ServiceProviderConfig.entity';
import { IdentityProviderConfig } from '@seaccentral/core/dist/sso/IdentityProviderConfig.entity';

import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      User,
      Role,
      Invitation,
      UserAuthProvider,
      UserSession,
      LoginSetting,
      UserRole,
      Organization,
      OrganizationUser,
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
  providers: [OrganizationService],
  controllers: [OrganizationController],
  exports: [OrganizationService],
})
export class OrganizationModule {}
