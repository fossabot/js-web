import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordSetting } from '@seaccentral/core/dist/admin/Password.setting.entity';
import { JwtStrategy } from '@seaccentral/core/dist/auth/jwt.strategy';
import { CoreCertificateModule } from '@seaccentral/core/dist/certificate/coreCertificate.module';
import { CourseAccessCheckerModule } from '@seaccentral/core/dist/course/courseAccessChecker.module';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { CRMModule } from '@seaccentral/core/dist/crm/crm.module';
import { ExternalProviderModule } from '@seaccentral/core/dist/external-package-provider/external.provider.module';
import { LearningTrackAccessCheckerModule } from '@seaccentral/core/dist/learning-track/learningTrackAccessChecker.module';
import { LearningTrackEntityModule } from '@seaccentral/core/dist/learning-track/learningTrackEntity.module';
import { NotificationModule } from '@seaccentral/core/dist/notification/Notification.module';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { Order } from '@seaccentral/core/dist/payment/Order.entity';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { Transaction } from '@seaccentral/core/dist/payment/Transaction.entity';
import { QueueModule } from '@seaccentral/core/dist/queue/queue.module';
import { IdentityProviderConfig } from '@seaccentral/core/dist/sso/IdentityProviderConfig.entity';
import { ServiceProviderConfig } from '@seaccentral/core/dist/sso/ServiceProviderConfig.entity';
import { PasswordRecord } from '@seaccentral/core/dist/user/PasswordRecord.entity';
import { UserAuthProvider } from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { SystemAnnouncement } from '@seaccentral/core/dist/notification/SystemAnnouncement.entity';
import { UserNotification } from '@seaccentral/core/dist/notification/UserNotification.entity';
import { SSOService } from '../sso/sso.service';
import { AuthService } from './auth.service';
import { IndexController } from './index.controller';
import { JwtRefreshTokenStrategy } from './jwtRefreshToken.strategy';
import { LocalStrategy } from './local.strategy';
import { PasswordController } from './password.controller';
import { PasswordService } from './password.service';
import { PasswordResetMailer } from './passwordResetMailer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      Order,
      PasswordSetting,
      Organization,
      OrganizationUser,
      UserAuthProvider,
      IdentityProviderConfig,
      ServiceProviderConfig,
      SubscriptionPlan,
      Transaction,
      CourseOutline,
      UserNotification,
      SystemAnnouncement,
    ]),
    CoreCertificateModule,
    LearningTrackEntityModule,
    UsersModule,
    PassportModule,
    ExternalProviderModule,
    CourseAccessCheckerModule,
    LearningTrackAccessCheckerModule,
    CRMModule,
    NotificationModule,
    QueueModule,
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
    TypeOrmModule.forFeature([PasswordRecord]),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    SSOService,
    PasswordService,
    PasswordResetMailer,
  ],
  controllers: [IndexController, PasswordController],
  exports: [AuthService],
})
export class AuthModule {}
