import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtStrategy } from '@seaccentral/core/dist/auth/jwt.strategy';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';

import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionPlan, Organization]),
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
  providers: [PlanService, JwtStrategy],
  controllers: [PlanController],
  exports: [PlanService],
})
export class PlanModule {}
