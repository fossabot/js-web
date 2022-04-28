import { User } from '@seaccentral/core/dist/user/User.entity';
import { BillingAddress } from '@seaccentral/core/dist/payment/BillingAddress.entity';
import { Exclude } from 'class-transformer';

export class GetBillingAddressDto {
  @Exclude()
  user: User;

  constructor(billingAddress: BillingAddress) {
    Object.assign(this, billingAddress);
  }
}
