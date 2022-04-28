import crypto from 'crypto';
import numeral from 'numeral';
import { add, format } from 'date-fns';
import { Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import {
  Order,
  OrderStatus,
} from '@seaccentral/core/dist/payment/Order.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { encodeJson } from '@seaccentral/core/dist/utils/2c2p';
import { formatWithTimezone } from '@seaccentral/core/dist/utils/date';
import { BANGKOK_TIMEZONE } from '@seaccentral/core/dist/utils/constants';
import { CouponLock } from '@seaccentral/core/dist/coupon/CouponLock.entity';
import { TaxInvoice } from '@seaccentral/core/dist/payment/TaxInvoice.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { Transaction } from '@seaccentral/core/dist/payment/Transaction.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { CouponDetailArRaw } from '@seaccentral/core/dist/raw-product/CouponDetailArRaw.entity';
import { PAYMENT_OPTIONS } from '@seaccentral/core/dist/external-package-provider/instancy.service';

import {
  PaymentGatewayCallbackV4,
  RawPaymentGatewayCallbackV4,
  COMMON_2C2P_RESPONSE_CODE,
} from '@seaccentral/core/dist/payment/PaymentGatewayCallbackV4';
import { nanoid } from 'nanoid';
import { CRM_PAYMENT_CHANNEL } from '@seaccentral/core/dist/crm/payment';
import {
  InitializePaymentResponseBody,
  TaxInvoiceRequestBody,
} from './dto/InitializePayment.dto';
import { CartService } from '../cart/cart.service';
import { CouponService } from '../cart/coupon.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { PaymentGateWayCallbackResponse } from './dto/PaymentGateWayCallbackResponse.dto';
import { _2C2PService } from './_2c2p.service';
import { FrontendCallbackDto } from './dto/FrontendCallback.dto';
import { PaymentPublisherService } from '../payment-publisher/paymentPublisher.service';

@Injectable()
export class IndexService extends TransactionFor<IndexService> {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(TaxInvoice)
    private taxInvoiceRepository: Repository<TaxInvoice>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    private subscriptionService: SubscriptionService,
    private readonly couponService: CouponService,
    private readonly cartService: CartService,
    moduleRef: ModuleRef,
    private readonly jwtService: JwtService,
    private readonly _2c2pService: _2C2PService,
    @InjectRepository(CouponLock)
    private readonly couponLockRepository: Repository<CouponLock>,
    private readonly paymentPublisherService: PaymentPublisherService,
  ) {
    super(moduleRef);
  }

  private readonly logger = new Logger(IndexService.name);

  async initializePayment(
    user: User,
    {
      paymentOption,
      planId,
      taxInvoice,
      issueTaxInvoice,
      billingAddressId,
      couponCode,
      redirectUrl,
      email,
    }: {
      planId: string;
      paymentOption: PAYMENT_OPTIONS;
      issueTaxInvoice: boolean;
      taxInvoice?: TaxInvoiceRequestBody;
      billingAddressId?: string;
      couponCode?: string;
      redirectUrl: string;
      email: string;
    },
  ): Promise<InitializePaymentResponseBody> {
    try {
      const { merchantId } =
        this._2c2pService.getMerchantIdAndSecretByPaymentOption(paymentOption);

      const plan = await this.subscriptionPlanRepository.findOne(planId, {
        where: { isActive: true, isPublic: true },
      });

      if (!plan) {
        throw new HttpException('Plan not found', HttpStatus.NOT_FOUND);
      }

      let discount = 0;
      let couponLock;
      let coupon: CouponDetailArRaw | undefined;
      if (couponCode) {
        coupon = await this.couponService.getValidCoupon(
          couponCode,
          plan,
          user,
        );
        discount = await this.couponService.getDiscount(coupon, plan);
        couponLock = await this.couponService.lockCouponForUser(coupon, user);
      }

      const paymentDescription = plan.name;
      const cartTotal = this.cartService.total(plan, discount);
      const order = await this.createOrder(
        user,
        plan,
        issueTaxInvoice || false,
        this.cartService.requirePayment(+cartTotal.grandTotal),
        coupon?.id,
        cartTotal,
      );

      if (issueTaxInvoice) {
        await this.createTaxInvoice(
          order,
          taxInvoice as TaxInvoiceRequestBody,
          billingAddressId,
        );
      }

      let paymentUrl = `${this.configService.get('CLIENT_BASE_URL')}/order/${
        order.id
      }/status`;
      if (+cartTotal.grandTotal > 0) {
        const couponTimeout = Number(
          this.configService.get('COUPON_TIMEOUT_MINUTE'),
        );

        const paymentTokenData = await this._2c2pService.getPaymentToken({
          frontendReturnUrl: redirectUrl,
          merchantID: merchantId,
          invoiceNo: order.id,
          amount: +cartTotal.grandTotal,
          currencyCode: plan.currency,
          paymentChannel: [paymentOption],
          description: paymentDescription,
          backendReturnUrl: this.configService.get(
            'PAYMENT_COMPLETE_REDIRECT_URL',
          ),
          paymentExpiry: formatWithTimezone(
            couponLock?.expiresOn ??
              add(new Date(), { minutes: couponTimeout }),
            BANGKOK_TIMEZONE,
            'yyyy-MM-dd HH:mm:ss',
          ),
          userDefined1: encodeJson(cartTotal),
          userDefined2: coupon?.id,
        });

        paymentUrl = paymentTokenData.webPaymentUrl;
        order.paymentToken = paymentTokenData.paymentToken;
        await this.orderRepository.save(order);

        if (couponLock?.expiresOn) {
          couponLock.expiresOn = add(couponLock.expiresOn, { minutes: 1 });
          await this.couponLockRepository.save(couponLock);
        }
      } else {
        const subscription = await this.linkUserToSubscription(order);
        if (coupon) {
          await this.couponService.markCouponAsUsed(coupon.id);
        }
        this.paymentPublisherService.publishPaymentSuccess(
          order,
          subscription,
          {
            merchantID: order.dealId as string,
            invoiceNo: order.id,
            amount: 0,
            currencyCode: 'THB',
            recurringUniqueID: '',
            tranRef: order.dealId as string,
            referenceNo: '',
            approvalCode: order.dealId as string,
            eci: '',
            transactionDateTime: format(
              new Date(order.createdAt),
              'yyyyMMddHHmmss',
            ),
            agentCode: '',
            channelCode: CRM_PAYMENT_CHANNEL.CREDIT_CARD,
            issuerCountry: '',
            issuerBank: '',
            idempotencyID: '',
            paymentScheme: '',
            respCode: COMMON_2C2P_RESPONSE_CODE.SUCCESS,
            respDesc: 'Success',
          },
        );
      }
      return {
        paymentUrl,
      };
    } catch (error) {
      this.logger.error('error initializing', error);

      if (error.constraint === 'email_check') {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Email is not valid!',
            code: '400_001',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw error;
    }
  }

  createPaymentHash(key: string, value: string) {
    return crypto
      .createHmac('sha256', key)
      .update(value)
      .digest('hex')
      .toUpperCase();
  }

  async generateRedirectUrl(
    data: RawPaymentGatewayCallbackV4,
  ): Promise<string> {
    const clientUrl = this.configService.get('CLIENT_BASE_URL') as string;

    const decoded = JSON.parse(
      Buffer.from(data.payload, 'base64').toString(),
    ) as FrontendCallbackDto;

    if (!decoded || !decoded.invoiceNo) return clientUrl;

    const orderId = decoded.invoiceNo as string;
    const order = await this.orderRepository.findOne({
      id: orderId,
    });

    if (!order) return clientUrl;

    await this.inquiryAndUpdateOrder(order, decoded.channelCode);

    return `${this.configService.get('CLIENT_BASE_URL')}/order/${
      order.id
    }/status`;
  }

  buildVerificationHash(body: PaymentGateWayCallbackResponse) {
    const secretKey = this._2c2pService.getSecretByMerchant(body.merchant_id);

    const {
      version,
      merchant_id,
      request_timestamp,
      order_id,
      invoice_no,
      currency,
      amount,
      transaction_ref,
      approval_code,
      eci,
      transaction_datetime,
      payment_channel,
      payment_status,
      channel_response_code,
      channel_response_desc,
      masked_pan,
      stored_card_unique_id,
      backend_invoice,
      paid_channel,
      paid_agent,
      recurring_unique_id,
      user_defined_1,
      user_defined_2,
      user_defined_3,
      user_defined_4,
      user_defined_5,
      browser_info,
      ippPeriod,
      ippInterestType,
      ippInterestRate,
      ippMerchantAbsorbRate,
      payment_scheme,
      process_by,
      sub_merchant_list,
    } = body || {};

    const checkHashString = this.concatenateStringValues([
      version,
      request_timestamp,
      merchant_id,
      order_id,
      invoice_no,
      currency,
      amount,
      transaction_ref,
      approval_code,
      eci,
      transaction_datetime,
      payment_channel,
      payment_status,
      channel_response_code,
      channel_response_desc,
      masked_pan,
      stored_card_unique_id,
      backend_invoice,
      paid_channel,
      paid_agent,
      recurring_unique_id,
      user_defined_1,
      user_defined_2,
      user_defined_3,
      user_defined_4,
      user_defined_5,
      browser_info,
      ippPeriod,
      ippInterestType,
      ippInterestRate,
      ippMerchantAbsorbRate,
      payment_scheme,
      process_by,
      sub_merchant_list,
    ]);

    const checkHash = this.createPaymentHash(secretKey, checkHashString);
    return checkHash;
  }

  verifyPaymentResponseHash(requestHash: string, responseHash: string) {
    if (
      requestHash
        .toLocaleLowerCase()
        .localeCompare(responseHash.toLocaleLowerCase()) !== 0
    ) {
      return false;
    }

    return true;
  }

  async processPaymentResponse(verifiedData: PaymentGatewayCallbackV4) {
    try {
      if (verifiedData.respCode === COMMON_2C2P_RESPONSE_CODE.SUCCESS) {
        return this.processPaymentBackendResponse(verifiedData);
      }

      return this.processPaymentResponseFailure(verifiedData);
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        'Error processing payment',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async verifyToken(
    rawData: RawPaymentGatewayCallbackV4,
  ): Promise<PaymentGatewayCallbackV4> {
    const decoded = this.jwtService.decode(
      rawData.payload,
    ) as PaymentGatewayCallbackV4;
    const merchantId = decoded.merchantID;
    const secret = this._2c2pService.getSecretByMerchant(merchantId);

    const verifiedData = await this.jwtService.verify<PaymentGatewayCallbackV4>(
      rawData.payload,
      { secret },
    );

    return verifiedData;
  }

  private async createTransactionIfNotExist(data: PaymentGatewayCallbackV4) {
    const order = await this.orderRepository.findOne({
      where: { id: data.invoiceNo },
    });
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    const existingTransaction = await this.transactionRepository.findOne({
      where: { transactionRef: data.tranRef, status: data.respCode },
    });

    if (existingTransaction) {
      this.logger.log(
        'Existing transaction',
        existingTransaction.transactionRef,
      );

      return { order, paymentBody: data, subscription: undefined };
    }

    await this.createTransaction(order, data);

    return { order, paymentBody: data, subscription: undefined };
  }

  private async processPaymentBackendResponse(data: PaymentGatewayCallbackV4) {
    const { order } = await this.createTransactionIfNotExist(data);

    try {
      const subscription = await this.linkUserToSubscription(order);

      order.status = OrderStatus.COMPLETED;
      await this.orderRepository.save(order);

      // userDefined2 is coupon detail id
      // TODO: use from order table instead of using param from 2c2p
      if (data.userDefined2) {
        await this.couponService.markCouponAsUsed(data.userDefined2);
      }

      return { paymentBody: data, order, subscription };
    } catch (error) {
      this.logger.error('Error processing success payment response', error);

      order.status = OrderStatus.PENDING;
      await this.orderRepository.save(order);

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Linking user to subscription plan
   * @param order Order object
   * @param data data returns from Payment Gateway
   * @returns instance of created subscription
   */
  private async linkUserToSubscription(order: Order) {
    const subscription = await this.subscriptionService.subscribe(
      order.user,
      order.subscriptionPlan,
      {},
      order,
    );
    return subscription;
  }

  private async processPaymentResponseFailure(data: PaymentGatewayCallbackV4) {
    this.logger.log('Failed to process payment', JSON.stringify(data));

    const order = await this.orderRepository.findOne({
      where: { id: data.invoiceNo },
    });

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    order.status = OrderStatus.FAILED;
    await this.orderRepository.save(order);

    return { order, paymentBody: data, subscription: undefined };
  }

  private async createTransaction(
    order: Order,
    data: PaymentGatewayCallbackV4,
  ) {
    const transaction = this.transactionRepository.create({
      status: data.respCode,
      transactionRef: data.tranRef,
      amount: data.amount.toString(),
      merchantId: data.merchantID,
      approvalCode: data.approvalCode,
      backendInvoiceNumber: data.referenceNo,
      paymentChannel: data.channelCode,
      paymentResponseCode: data.respCode,
      paymentResponseDescription: data.respDesc,
      currencyCode: data.currencyCode,
      ippPeriod: data.installmentPeriod?.toString(),
      ippInterestRate: data.interestRate?.toString(),
      ippInterestType: data.interestType,
      ippMerchantAbsorbRate: data.installmentMerchantAbsorbRate?.toString(),
      metaData: JSON.stringify(data || {}),
      order,
      orderId: order.id,
    });

    return this.transactionRepository.save(transaction);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private concatenateStringValues(values: any[]) {
    return values.reduce((acc: string, val: string) => {
      if (val.trim() === '') return acc;
      acc += val.trim();
      return acc;
    }, '');
  }

  private async createOrder(
    user: User,
    plan: SubscriptionPlan,
    issueTaxInvoice: boolean,
    isRequiredPayment: boolean,
    couponId?: string,
    metaData?: any,
  ) {
    const order = this.orderRepository.create({
      status: isRequiredPayment ? OrderStatus.PENDING : OrderStatus.COMPLETED,
      planId: plan.productId,
      subscriptionPlan: plan,
      userId: user.id,
      user,
      issueTaxInvoice,
      couponId,
      metaData: {
        price: numeral(plan.price).value() || 0,
        grandTotal: numeral(metaData?.grandTotal).value() || 0,
        subTotal: numeral(metaData?.subTotal).value() || 0,
        discount: numeral(metaData?.discount).value() || 0,
        vat: numeral(metaData?.vat).value() || 0,
        vatRate: metaData?.vatRate || 0,
      },
      dealId: nanoid(20),
    });

    await this.orderRepository.save(order);
    await order.reload();

    return order;
  }

  private async createTaxInvoice(
    order: Order,
    taxInvoice: TaxInvoiceRequestBody,
    billingAddressId?: string,
  ) {
    const invoice = this.taxInvoiceRepository.create({
      ...taxInvoice,
      province: { id: taxInvoice.provinceId },
      district: { id: taxInvoice.districtId },
      subdistrict: { id: taxInvoice.subdistrictId },
      order,
      orderId: order.id,
      billingAddress: billingAddressId ? { id: billingAddressId } : undefined,
    });

    return this.taxInvoiceRepository.save(invoice);
  }

  private getPaymentOptionByMerchantId(merchantId?: string) {
    switch (merchantId) {
      case this.configService.get('PAYMENT_2C2P_MERCHANT_ID'):
        return PAYMENT_OPTIONS.CREDIT_CARD;

      case this.configService.get('PAYMENT_2C2P_QR_MERCHANT_ID'):
        return PAYMENT_OPTIONS.QR_CODE;

      case this.configService.get('PAYMENT_2C2P_INSTALLMENT_MERCHANT_ID'):
        return PAYMENT_OPTIONS.INSTALLMENT_PAYMENT;

      default:
        return PAYMENT_OPTIONS.CREDIT_CARD;
    }
  }

  private async inquiryAndUpdateOrder(
    order: Order,
    channelCode: PAYMENT_OPTIONS,
  ): Promise<void> {
    if (
      !order.paymentToken ||
      [OrderStatus.COMPLETED, OrderStatus.CANCELED].some(
        (s) => s === order.status,
      )
    )
      return;

    const inquiryResult = await this._2c2pService.paymentInquiry(
      order.paymentToken,
      order.id,
      channelCode,
    );

    if (!inquiryResult) return;

    if (inquiryResult.respCode === COMMON_2C2P_RESPONSE_CODE.SUCCESS) {
      order.status = OrderStatus.COMPLETED;
    } else if (inquiryResult.respCode === COMMON_2C2P_RESPONSE_CODE.CANCELLED) {
      order.status = OrderStatus.CANCELED;
      if (order.couponId)
        await this.couponService.unlockCoupons(order.couponId, order.userId);
    } else if (inquiryResult.respCode === COMMON_2C2P_RESPONSE_CODE.PENDING) {
      order.status = OrderStatus.PENDING;
    } else {
      order.status = OrderStatus.FAILED;
    }

    await this.orderRepository.save(order);
  }
}
