/* eslint-disable max-classes-per-file */

import { UserTaxInvoice } from '@seaccentral/core/dist/user/UserTaxInvoice.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Transform, Type } from 'class-transformer';
import { BillingAddress } from '@seaccentral/core/dist/payment/BillingAddress.entity';
import {
  transformUser,
  PartialUser,
} from '@seaccentral/core/dist/utils/user-transform';
import { ApiProperty } from '@nestjs/swagger';

class GetBillingAddressDto extends BillingAddress {
  @Transform(({ value }) => transformUser(value))
  @ApiProperty({ type: () => PartialUser })
  user: User;
}

export class GetTaxInvoiceDto extends UserTaxInvoice {
  @Transform(({ value }) => transformUser(value))
  @ApiProperty({ type: () => PartialUser })
  user: User;

  @Type(() => GetBillingAddressDto)
  billingAddress: GetBillingAddressDto | null;

  constructor(data: UserTaxInvoice) {
    super();
    Object.assign(this, data);
  }
}
