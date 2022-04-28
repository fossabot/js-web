import 'reflect-metadata';
import { classToPlain } from 'class-transformer';
import { getUnixTime } from 'date-fns';
import { Order } from '@seaccentral/core/dist/payment/Order.entity';
import { OrderSummaryDto } from '../order-summary.dto';
import { PeriodQuery } from '../period-query.dto';
import {
  IExpiredUser,
  IMemberType,
  INewUser,
  IPackageType,
  IRenewUser,
} from '../order-summary.service';

describe('OrderSummaryDto', () => {
  it('transform period', () => {
    const period = new PeriodQuery();
    const dto = new OrderSummaryDto({ period });

    const result = classToPlain(dto);

    expect(result.period.fromTimestamp).toEqual(getUnixTime(period.fromDate));
    expect(result.period.toTimestamp).toEqual(getUnixTime(period.toDate));
  });

  it('transform newUser', () => {
    const newUser: INewUser[] = [{ userId: '', subscriptionIds: [] }];
    const dto = new OrderSummaryDto({ newUser });

    const result = classToPlain(dto);

    expect(result.newUser).toEqual(1);
  });

  it('transform renewUser', () => {
    const renewUser: IRenewUser[] = [{ userId: '', totalSubscription: 0 }];
    const dto = new OrderSummaryDto({ renewUser });

    const result = classToPlain(dto);

    expect(result.renewUser).toEqual(1);
  });

  it('transform expiredUser', () => {
    const expiredUser: IExpiredUser[] = [{ userId: '', totalSubscription: 0 }];
    const dto = new OrderSummaryDto({ expiredUser });

    const result = classToPlain(dto);

    expect(result.expiredUser).toEqual(1);
  });

  it('transform unsuccessfulPayment', () => {
    const unsuccessfulPayment: Order[] = [new Order()];
    const dto = new OrderSummaryDto({ unsuccessfulPayment });

    const result = classToPlain(dto);

    expect(result.unsuccessfulPayment).toEqual(1);
  });

  it('transform packageType', () => {
    const packageType: IPackageType[] = [{ packageType: 'somePackage' }];
    const dto = new OrderSummaryDto({ packageType });

    const result = classToPlain(dto);

    expect(result.packageType).toEqual(['somePackage']);
  });

  it('transform memberType', () => {
    const memberType: IMemberType[] = [{ memberType: 'new' }];
    const dto = new OrderSummaryDto({ memberType });

    const result = classToPlain(dto);

    expect(result.memberType).toEqual(['new']);
  });
});
