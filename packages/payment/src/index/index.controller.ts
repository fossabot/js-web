import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { OrderStatus } from '@seaccentral/core/dist/payment/Order.entity';
import { TrimPipe } from '@seaccentral/core/dist/utils/TrimPipe';
import { PlanUpgradeActivator } from '@seaccentral/core/dist/user/PlanUpgrade.activator';
import { Response } from 'express';
import { Connection } from 'typeorm';
import { RawPaymentGatewayCallbackV4 } from '@seaccentral/core/dist/payment/PaymentGatewayCallbackV4';
import {
  InitializePaymentRequestBody,
  InitializePaymentResponseBody,
} from './dto/InitializePayment.dto';
import { IndexService } from './index.service';
import IRequestWithUser from './interface/IRequestWithUser.interface';
import { PaymentPublisherService } from '../payment-publisher/paymentPublisher.service';

@Controller('v1')
export class IndexController {
  private readonly logger = new Logger(IndexController.name);

  constructor(
    private readonly connection: Connection,
    private readonly indexService: IndexService,
    private readonly paymentPublisherService: PaymentPublisherService,
  ) {}

  @Post('gateway/callback/frontend')
  async callback(
    @Body() data: { paymentResponse: string },
    @Res() res: Response,
  ) {
    const redirectUrl = await this.indexService.generateRedirectUrl({
      payload: data.paymentResponse,
    });

    return res.redirect(redirectUrl);
  }

  @UseGuards(JwtAuthGuard, PlanUpgradeActivator)
  @Post('initialize')
  @HttpCode(200)
  @UsePipes(new TrimPipe())
  async initialize(
    @Req() request: IRequestWithUser,
    @Body()
    initializePaymentBody: InitializePaymentRequestBody,
  ) {
    const {
      paymentOptions,
      planId,
      billingAddressId,
      taxInvoice,
      issueTaxInvoice,
      couponCode,
      redirectUrl,
      email,
    } = initializePaymentBody;
    const { user } = request;

    try {
      const initializedPayment = await this.connection.transaction(
        (manager) => {
          return this.indexService.initializePayment(user, {
            planId,
            email,
            paymentOption: paymentOptions,
            billingAddressId,
            taxInvoice,
            issueTaxInvoice,
            couponCode,
            redirectUrl,
          });
        },
      );

      const response = new BaseResponseDto<InitializePaymentResponseBody>();
      response.data = initializedPayment;

      return response;
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  @Post('gateway/callback')
  @HttpCode(200)
  async process(
    @Body() body: RawPaymentGatewayCallbackV4,
    @Res() res: Response,
  ) {
    const verifiedData = await this.indexService.verifyToken(body);

    try {
      const data = await this.connection.transaction(async (manager) => {
        const result = await this.indexService
          .withTransaction(manager)
          .processPaymentResponse(verifiedData);

        return result;
      });

      if (
        data &&
        data.order &&
        data.order.status === OrderStatus.COMPLETED &&
        data.subscription
      ) {
        this.paymentPublisherService
          .publishPaymentSuccess(
            data.order,
            data.subscription,
            data.paymentBody,
          )
          .catch((error) =>
            this.logger.error(
              'Failed publish payment success',
              JSON.stringify(error),
            ),
          );
      }

      if (data && data.order.status === OrderStatus.FAILED) {
        this.paymentPublisherService
          .publishPaymentFailure(data.order, data.paymentBody)
          .catch((error) =>
            this.logger.error(
              'Failed publish payment failure',
              JSON.stringify(error),
            ),
          );
        return res.status(HttpStatus.BAD_REQUEST);
      }

      return '';
    } catch (error) {
      this.logger.error('Error processing payment', error);
      throw new HttpException(
        'Error processing payment',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('healthcheck')
  @HttpCode(200)
  healthCheck() {
    return 'healthy';
  }
}
