import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Header,
  HttpCode,
  Query,
  Response,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { Response as ExpressResponse } from 'express';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { formatWithTimezone } from '@seaccentral/core/dist/utils/date';
import { DEFAULT_TIMEZONE } from '@seaccentral/core/dist/utils/constants';
import { PeriodQuery } from './period-query.dto';
import { OrderSummaryService } from './order-summary.service';
import { OrderSummaryExporter } from './order-summary-exporter.service';
import { OrderSummaryDto } from './order-summary.dto';

@Controller('v1/dashboard')
@ApiTags('Dashboard')
export class DashboardController {
  constructor(
    private readonly orderSummaryService: OrderSummaryService,
    private readonly orderSummaryExporter: OrderSummaryExporter,
  ) {}

  @Get('payment')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getPayment(
    @Query(new ValidationPipe({ transform: true })) period: PeriodQuery,
  ) {
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

    const orderSummaryResponse = new OrderSummaryDto({
      period,
      newUser,
      renewUser,
      expiredUser,
      unsuccessfulPayment,
      packageType,
      memberType,
      revenue,
    });

    const response = new BaseResponseDto<OrderSummaryDto>();
    response.data = orderSummaryResponse;

    return response;
  }

  @Get('payment/csv')
  @UseGuards(JwtAuthGuard)
  @Header('Content-type', 'application/csv')
  @HttpCode(200)
  async exportCsv(
    @Query(new ValidationPipe({ transform: true })) period: PeriodQuery,
    @Response() res: ExpressResponse,
  ) {
    const csvStream = await this.orderSummaryExporter.asCsv(period);
    const { fromDate, toDate } = period;
    const filename = `report-from-${formatWithTimezone(
      fromDate,
      DEFAULT_TIMEZONE,
      'dd-MM-yyyy',
    )}-to-${formatWithTimezone(toDate, DEFAULT_TIMEZONE, 'dd-MM-yyyy')}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    return csvStream.pipe(res);
  }
}
