import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from '@seaccentral/core/dist/auth/jwt.strategy';
import { CourseAccessCheckerModule } from '@seaccentral/core/dist/course/courseAccessChecker.module';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { LearningTrackAccessCheckerModule } from '@seaccentral/core/dist/learning-track/learningTrackAccessChecker.module';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { IdentityProviderConfig } from '@seaccentral/core/dist/sso/IdentityProviderConfig.entity';
import { ServiceProviderConfig } from '@seaccentral/core/dist/sso/ServiceProviderConfig.entity';
import { UserAuthProvider } from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { SSOController } from './sso.controller';
import { SSOService } from './sso.service';

@Module({
  imports: [
    ConfigModule,
    CourseAccessCheckerModule,
    LearningTrackAccessCheckerModule,
    TypeOrmModule.forFeature([
      Organization,
      OrganizationUser,
      UserAuthProvider,
      IdentityProviderConfig,
      ServiceProviderConfig,
      SubscriptionPlan,
      CourseOutline,
      Subscription,
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
    UsersModule,
  ],
  providers: [SSOService, JwtStrategy],
  controllers: [SSOController],
  exports: [SSOService],
})
export class SSOModule {}
