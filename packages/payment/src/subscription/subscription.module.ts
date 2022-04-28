import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtStrategy } from '@seaccentral/core/dist/auth/jwt.strategy';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { QueueModule } from '@seaccentral/core/dist/queue/queue.module';

import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';

@Module({
  imports: [
    QueueModule,
    TypeOrmModule.forFeature([SubscriptionPlan, Subscription]),
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
  providers: [SubscriptionService, JwtStrategy],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
