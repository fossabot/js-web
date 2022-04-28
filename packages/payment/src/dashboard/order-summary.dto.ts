import { Order } from '@seaccentral/core/dist/payment/Order.entity';
import { Transform } from 'class-transformer';
import { getUnixTime } from 'date-fns';
import {
  IExpiredUser,
  IMemberType,
  INewUser,
  IPackageType,
  IRenewUser,
} from './order-summary.service';
import { PeriodQuery } from './period-query.dto';

export class OrderSummaryDto {
  @Transform(({ value }: { value: PeriodQuery }) => ({
    fromTimestamp: getUnixTime(value.fromDate),
    toTimestamp: getUnixTime(value.toDate),
  }))
  period: PeriodQuery;

  @Transform(({ value }: { value: INewUser[] }) => value.length)
  newUser: INewUser[];

  @Transform(({ value }: { value: IRenewUser[] }) => value.length)
  renewUser: IRenewUser[];

  @Transform(({ value }: { value: IExpiredUser[] }) => value.length)
  expiredUser: IExpiredUser[];

  @Transform(({ value }: { value: Order[] }) => value.length)
  unsuccessfulPayment: Order[];

  @Transform(({ value }: { value: IPackageType[] }) =>
    value.map((pkg) => pkg.packageType),
  )
  packageType: IPackageType[];

  @Transform(({ value }: { value: IMemberType[] }) =>
    value.map((pkg) => pkg.memberType),
  )
  memberType: IMemberType[];

  revenue: number;

  constructor(partial: Partial<OrderSummaryDto>) {
    Object.assign(this, partial);
  }
}
