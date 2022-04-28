import { BillingAddress } from '@seaccentral/core/dist/payment/BillingAddress.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { classToPlain } from 'class-transformer';
import { GetBillingAddressDto } from './GetBillingAddress.dto';

describe('GetBillingAddressDto', () => {
  it('should omit user field', () => {
    const billingAddress = new BillingAddress();
    const user = new User();
    user.email = 'john.doe@mail.com';
    billingAddress.user = new User();
    const dto = new GetBillingAddressDto(billingAddress);

    const output = classToPlain(dto);

    expect(output).not.toHaveProperty('user');
  });
});
