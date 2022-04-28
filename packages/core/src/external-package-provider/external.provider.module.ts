import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserThirdParty } from '../user/UserThirdParty.entity';
import { Subscription } from '../payment/Subscription.entity';
import { SubscriptionPlan } from '../payment/SubscriptionPlan.entity';
import { CoorpacademyService } from './coorpacademy.service';

import { InstancyService } from './instancy.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, SubscriptionPlan, UserThirdParty]),
  ],
  providers: [InstancyService, CoorpacademyService],
  exports: [InstancyService, TypeOrmModule, CoorpacademyService],
})
export class ExternalProviderModule {}
