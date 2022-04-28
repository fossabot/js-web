import { Injectable } from '@nestjs/common';
import * as csv from 'fast-csv';
import { OrderSummaryService } from './order-summary.service';
import { PeriodQuery } from './period-query.dto';

@Injectable()
export class OrderSummaryExporter {
  constructor(private readonly orderSummaryService: OrderSummaryService) {}

  async asCsv(period: PeriodQuery) {
    const [
      newUser,
      renewUser,
      expiredUser,
      unsuccessfulPayment,
      packageType,
      memberType,
      revenue,
    ] = await Promise.all([
      this.orderSummaryService.newUser(period),
      this.orderSummaryService.renewUser(period),
      this.orderSummaryService.expiredSubscription(period),
      this.orderSummaryService.unsuccessfulPayment(period),
      this.orderSummaryService.packageType(period),
      this.orderSummaryService.memberType(period),
      this.orderSummaryService.revenue(period),
    ]);
    const memberTypeString = memberType
      .map((singlePackage) => singlePackage.memberType)
      .join(',');
    const packageTypeString = packageType
      .map((singlePackage) => singlePackage.packageType)
      .join(',');

    const csvStream = csv.format({ headers: true });
    csvStream.write({
      newUser: newUser.length,
      renewUser: renewUser.length,
      expiredUser: expiredUser.length,
      unsuccessfulPayment: unsuccessfulPayment.length,
      packageType: packageTypeString,
      memberType: memberTypeString,
      revenue,
    });
    csvStream.end();

    return csvStream;
  }
}
