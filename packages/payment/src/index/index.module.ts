import { HttpModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Order } from '@seaccentral/core/dist/payment/Order.entity';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { JwtStrategy } from '@seaccentral/core/dist/auth/jwt.strategy';
import { UserSession } from '@seaccentral/core/dist/user/UserSession.entity';
import { TaxInvoice } from '@seaccentral/core/dist/payment/TaxInvoice.entity';
import { Transaction } from '@seaccentral/core/dist/payment/Transaction.entity';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { BillingAddress } from '@seaccentral/core/dist/payment/BillingAddress.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { InstancyService } from '@seaccentral/core/dist/external-package-provider/instancy.service';
import { UserThirdParty } from '@seaccentral/core/dist/user/UserThirdParty.entity';
import { CoreCouponModule } from '@seaccentral/core/dist/coupon/coreCoupon.module';
import { QueueModule } from '@seaccentral/core/dist/queue/queue.module';
import { SubscriptionService } from '../subscription/subscription.service';
import { IndexController } from './index.controller';
import { IndexService } from './index.service';
import { CartModule } from '../cart/cart.module';
import { PlanModule } from '../plan/plan.module';
import { _2C2PService } from './_2c2p.service';
import { PaymentPublisherModule } from '../payment-publisher/publisher.module';

@Module({
  imports: [
    UsersModule,
    CartModule,
    PlanModule,
    HttpModule,
    CoreCouponModule,
    PaymentPublisherModule,
    QueueModule,
    TypeOrmModule.forFeature([
      User,
      UserSession,
      Transaction,
      Order,
      TaxInvoice,
      BillingAddress,
      SubscriptionPlan,
      Subscription,
      UserThirdParty,
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
  providers: [
    IndexService,
    JwtStrategy,
    InstancyService,
    SubscriptionService,
    _2C2PService,
  ],
  controllers: [IndexController],
})
export class IndexModule {}
