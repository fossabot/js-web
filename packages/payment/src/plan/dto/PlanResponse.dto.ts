import { Expose } from 'class-transformer';
import { ApiResponseProperty } from '@nestjs/swagger';

import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';

@Expose()
export class PlanResponse extends SubscriptionPlan {
  @ApiResponseProperty()
  @Expose()
  id: string;

  @ApiResponseProperty()
  @Expose()
  isActive: boolean;

  constructor(partial: Partial<SubscriptionPlan>) {
    super();
    Object.assign(this, partial);
  }
}
