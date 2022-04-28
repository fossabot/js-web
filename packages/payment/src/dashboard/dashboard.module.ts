import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from '@seaccentral/core/dist/payment/Order.entity';
import { Transaction } from '@seaccentral/core/dist/payment/Transaction.entity';

import { DashboardController } from './dashbaord.controller';
import { OrderSummaryService } from './order-summary.service';
import { OrderSummaryExporter } from './order-summary-exporter.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Transaction])],
  controllers: [DashboardController],
  providers: [OrderSummaryService, OrderSummaryExporter],
  exports: [TypeOrmModule],
})
export class DashboardModule {}
