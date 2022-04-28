import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { Role } from '@seaccentral/core/dist/user/Role.entity';
import { JwtStrategy } from '@seaccentral/core/dist/auth/jwt.strategy';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { UserRole } from '@seaccentral/core/dist/user/UserRole.entity';
import { UserSession } from '@seaccentral/core/dist/user/UserSession.entity';
import { LoginSetting } from '@seaccentral/core/dist/admin/Login.setting.entity';
import { Invitation } from '@seaccentral/core/dist/invitation/Invitation.entity';
import { PasswordSetting } from '@seaccentral/core/dist/admin/Password.setting.entity';
import { UserAuthProvider } from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import { UserUploadHistory } from '@seaccentral/core/dist/user/UserUploadHistory.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';

import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { SearchModule } from '../search/search.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    OrganizationModule,
    UsersModule,
    SearchModule,
    TypeOrmModule.forFeature([
      LoginSetting,
      User,
      UserUploadHistory,
      UserAuthProvider,
      UserSession,
      Role,
      Invitation,
      UserRole,
      PasswordSetting,
      SubscriptionPlan,
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
  controllers: [AdminController],
  providers: [AdminService, JwtStrategy],
  exports: [AdminService],
})
export class AdminModule {}
