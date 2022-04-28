import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtStrategy } from '@seaccentral/core/dist/auth/jwt.strategy';

import { CorePaymentModule } from '@seaccentral/core/dist/payment/corePayment.module';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';

import { Order } from '@seaccentral/core/dist/payment/Order.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { BillingAddress } from '@seaccentral/core/dist/payment/BillingAddress.entity';

import { OrderService } from './order.service';

import { OrderController } from './order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User, Subscription, BillingAddress]),
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
    CorePaymentModule,
    UsersModule,
  ],
  providers: [OrderService, JwtStrategy],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
