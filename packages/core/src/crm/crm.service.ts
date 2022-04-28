import {
  BadGatewayException,
  HttpException,
  HttpService,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { LessThan, LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { defaultTo, findKey } from 'lodash';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { addDays } from 'date-fns';
import {
  CRM_PAYMENT_STATUS,
  CRM_PAYMENT_CHANNEL,
  paymentStatusMap,
  PAYMENT_STATUS_RESPONSE_CODE,
} from './payment';
import { User } from '../user/User.entity';
import { Gender } from '../user/Gender.enum';
import { Order, OrderMetadata } from '../payment/Order.entity';
import { currencyMap } from '../utils/currency';
import { PriceBuilder } from '../utils/priceBuilder';
import placeholderGroupCompany from './crm.constant';
import { BANGKOK_TIMEZONE } from '../utils/constants';
import { Subscription } from '../payment/Subscription.entity';
import { CRMContactRetailPaid } from './crmContactRetailPaid';
import {
  convert2C2PFormatToUTCDate,
  dateToUTCDate,
  formatWithTimezone,
} from '../utils/date';
import { TaxInvoice, TaxType } from '../payment/TaxInvoice.entity';
import { OrganizationUser } from '../organization/OrganizationUser.entity';
import { CouponDetailArRaw } from '../raw-product/CouponDetailArRaw.entity';
import { CouponMasterArRaw } from '../raw-product/CouponMasterArRaw.entity';
import { decodeJson } from '../utils/2c2p';
import { UserThirdParty } from '../user/UserThirdParty.entity';
import { UserThirdPartyType } from '../user/UserThirdPartyType.enum';
import { PaymentGatewayCallbackV4 } from '../payment/PaymentGatewayCallbackV4';
import { PaymentConsumable } from '../payment/PaymentConsumble';

export interface ICartTotal {
  subTotal: string;

  discount?: string | null;

  vat: string;

  vatRate: string;

  grandTotal: string;
}

@Injectable()
export class CRMService implements PaymentConsumable {
  private readonly logger = new Logger(CRMService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(TaxInvoice)
    private taxInvoiceRepository: Repository<TaxInvoice>,
    @InjectRepository(OrganizationUser)
    private readonly organizationUserRepository: Repository<OrganizationUser>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(CouponDetailArRaw)
    private readonly couponDetailArRawRepository: Repository<CouponDetailArRaw>,
    @InjectRepository(CouponMasterArRaw)
    private readonly couponMasterArRawRepository: Repository<CouponMasterArRaw>,
    @InjectRepository(UserThirdParty)
    private readonly userThirdPartyRepository: Repository<UserThirdParty>,
  ) {}

  async onPaymentSuccess(
    order: Order,
    subscription: Subscription,
    data: PaymentGatewayCallbackV4,
  ) {
    try {
      const crmResponse = await this.createContactRetailPaid(
        data,
        subscription,
      );

      const existing3rdPartyUser = await this.userThirdPartyRepository.findOne({
        user: order.user,
        userThirdPartyType: UserThirdPartyType.CRM,
      });

      if (!existing3rdPartyUser) {
        const user3rdParty = this.userThirdPartyRepository.create({
          user: order.user,
          userThirdPartyType: UserThirdPartyType.CRM,
          userThirdPartyId: crmResponse.data[0]?.ID,
        });
        await this.userThirdPartyRepository.save(user3rdParty);
      }

      order.isSyncToCRM = true;
      await this.orderRepository.save(order);
    } catch (error) {
      this.logger.log('Failed to post payment success to CRM', error);
    }
  }

  async onPaymentFailure(order: Order, data: PaymentGatewayCallbackV4) {
    try {
      const crmResponse = await this.createContactRetailPaymentFailed(data);

      const existing3rdPartyUser = await this.userThirdPartyRepository.findOne({
        user: order.user,
        userThirdPartyType: UserThirdPartyType.CRM,
      });

      if (!existing3rdPartyUser) {
        const user3rdParty = this.userThirdPartyRepository.create({
          user: order.user,
          userThirdPartyType: UserThirdPartyType.CRM,
          userThirdPartyId: crmResponse.data[0]?.ID,
        });
        await this.userThirdPartyRepository.save(user3rdParty);
      }

      order.isSyncToCRM = true;
      await this.orderRepository.save(order);
    } catch (error) {
      this.logger.log('Failed to post payment failed to CRM', error);
    }
  }

  async createContactRetailPaid(
    data: PaymentGatewayCallbackV4,
    subscription: Subscription,
  ) {
    const { invoiceNo: orderId } = data;
    const [order, taxInvoice] = await Promise.all([
      this.orderRepository.findOneOrFail({
        where: { id: orderId },
      }),
      this.taxInvoiceRepository.findOne({ orderId }),
    ]);

    const payload: CRMContactRetailPaid = {
      ...(await this.crmPayment(order, data)),
      ...(await this.crmUser(order.user)),
      ...(await this.crmSubscription(order, subscription)),
      ...this.crmTaxInvoice(order, taxInvoice),
    };
    this.logger.log(
      'CRM Contact Retail Paid mapped payload',
      JSON.stringify(payload),
    );

    return this.requestCRMContactRetailPaid(payload);
  }

  async createContactRetailPaymentFailed(data: PaymentGatewayCallbackV4) {
    const { invoiceNo: orderId } = data;
    const [order, taxInvoice] = await Promise.all([
      this.orderRepository.findOneOrFail({
        where: { id: orderId },
      }),
      this.taxInvoiceRepository.findOne({ orderId }),
    ]);

    const payload: CRMContactRetailPaid = {
      ...(await this.crmPayment(order, data)),
      ...(await this.crmUser(order.user)),
      ...(await this.crmSubscription(order)),
      ...this.crmTaxInvoice(order, taxInvoice),
    };
    this.logger.log(
      'CRM Contact Retail Payment Failed mapped payload',
      JSON.stringify(payload),
    );

    return this.requestCRMContactRetailPaid(payload);
  }

  private async requestCRMContactRetailPaid(payload: CRMContactRetailPaid) {
    const path = this.configService.get('CRM_CONTACT_RETAIL_PAID_PATH');
    const sig = this.configService.get('SIGNATURE_CONTACT_RETAIL_PAID');

    try {
      const res = await this.httpService
        .post(`${path}${sig}`, payload)
        .toPromise();

      return res;
    } catch (error) {
      this.logger.error('CRM error', error);

      if (error.response) {
        this.logger.error(
          'CRM error response',
          JSON.stringify(error.response.data),
        );
        throw new HttpException(
          {
            source: error.response.request?.host,
            ...error.response.data,
          },
          error.response.status,
        );
      }

      throw new BadGatewayException(error.message);
    }
  }

  private async crmPayment(order: Order, data: PaymentGatewayCallbackV4) {
    if (!order.metaData) {
      throw new InternalServerErrorException(
        'No cart total metadata present in order to process price to crm',
      );
    }
    if (!order.dealId) {
      this.logger.warn(
        'No dealId found in order, will use order.id as a subsitute',
        order.id,
      );
    }
    const { amount } = data;
    const { couponId } = order;
    const { subTotal, vat, vatRate } = order.metaData;

    const discountPayload = couponId
      ? await this.crmCouponDiscount(couponId, order.metaData)
      : { discount: 0, discountamount: 0 };
    const CRMPayload = {
      amount: +subTotal,
      ...discountPayload,
      vat: +vatRate,
      vatamount: +vat,
      netamount: amount,
      reforderid: order.dealId || order.id,
      currency: data.currencyCode,
      refpayment1: data.tranRef,
      paymentstatus: data.respCode,
      paymentchannel: data.channelCode,
      channelresponsecode: data.respCode,
      channelresponsedesc: data.respDesc,
      approvecode: data.approvalCode || '-',
      transactiondatetime: formatWithTimezone(
        convert2C2PFormatToUTCDate(data.transactionDateTime) || new Date(),
        BANGKOK_TIMEZONE,
      ),
      merchantId: data.merchantID,
    };
    const crmPaymentStatus =
      paymentStatusMap[
        CRMPayload.paymentstatus as PAYMENT_STATUS_RESPONSE_CODE
      ];
    return {
      ...CRMPayload,
      paymentchannel: this.getPaymentChannelByMerchantId(CRMPayload.merchantId),
      paymentstatus: crmPaymentStatus,
      refpayment1:
        crmPaymentStatus === CRM_PAYMENT_STATUS.PAYMENT_FAILED
          ? '-'
          : CRMPayload.refpayment1,
      refpayment2: CRMPayload.merchantId,
    };
  }

  private async crmUser(user: User) {
    const {
      email,
      firstName: firstname,
      lastName: lastname,
      phoneNumber: phoneno,
      title: salutation,
      gender,
      jobTitle: jobtitle,
      createdAt,
      seacId,
    } = user;
    const userOrganization = await this.organizationUserRepository.findOne({
      user,
    });

    let crmGender: 'M' | 'F' | undefined;
    switch (gender) {
      case Gender.Male:
        crmGender = 'M';
        break;
      case Gender.Female:
        crmGender = 'F';
        break;
      default:
        crmGender = undefined;
    }

    return {
      email: defaultTo(email, ''),
      firstname: defaultTo(firstname, ''),
      lastname: defaultTo(lastname, ''),
      gender: crmGender,
      phoneno: defaultTo(phoneno, undefined),
      salutation: defaultTo(salutation, undefined),
      jobtitle: defaultTo(jobtitle, undefined),
      registerdatetime: formatWithTimezone(createdAt),
      memberid: seacId || undefined,
      groupcompany:
        userOrganization?.organization.id || placeholderGroupCompany,
    };
  }

  private crmTaxInvoice(order: Order, taxInvoice?: TaxInvoice) {
    if (!order.issueTaxInvoice || !taxInvoice) {
      return {
        fulltaxrequest: false,
      };
    }
    let taxType: string | undefined;
    switch (taxInvoice.taxType) {
      case TaxType.INDIVIDUAL:
        taxType = '1';
        break;
      case TaxType.ORGANIZATION:
        taxType = '2';
        break;
      default:
        taxType = undefined;
    }

    return {
      fulltaxrequest: true,
      fulltaxtype: taxType,
      fulltaxname: taxInvoice.taxEntityName,
      fulltaxheadofficebranch: taxInvoice.headOfficeOrBranch,
      fulltaxid: taxInvoice.taxId,
      fulltaxaddress1: taxInvoice.taxAddress,
      fulltaxaddress2: taxInvoice.subdistrict.subdistrictCode,
      fulltaxaddress3: taxInvoice.district.districtCode,
      fulltaxaddress4: taxInvoice.province.provinceCode,
      fulltaxaddress5: taxInvoice.country,
      fulltaxpostcode: taxInvoice.zipCode,
      fulltaxcontactperson: taxInvoice.contactPerson,
      fulltaxphonecontact: taxInvoice.contactPhoneNumber,
      fulltaxemailcontact: taxInvoice.contactEmail,
      fulltaxmailingaddress1: defaultTo(
        taxInvoice.billingAddress?.billingAddress,
        taxInvoice.taxAddress,
      ),
      fulltaxmailingaddress2: defaultTo(
        taxInvoice.billingAddress?.subdistrict.subdistrictCode,
        taxInvoice.subdistrict.subdistrictCode,
      ),
      fulltaxmailingaddress3: defaultTo(
        taxInvoice.billingAddress?.district.districtCode,
        taxInvoice.district.districtCode,
      ),
      fulltaxmailingaddress4: defaultTo(
        taxInvoice.billingAddress?.province.provinceCode,
        taxInvoice.province.provinceCode,
      ),
      fulltaxmailingaddress5: defaultTo(
        taxInvoice.billingAddress?.country,
        taxInvoice.country,
      ),
      fulltaxmailingpostcode: defaultTo(
        taxInvoice.billingAddress?.subdistrict.zipCode,
        taxInvoice.zipCode,
      ),
    };
  }

  private async crmSubscription(order: Order, subscription?: Subscription) {
    const { subscriptionPlan } = order;
    const now = new Date();
    let startDate = subscription?.startDate || now;
    const endDate = subscription?.endDate || now;
    const inactiveSubscriptionForRenew =
      await this.subscriptionRepository.findOne({
        where: {
          userId: order.userId,
          subscriptionPlanId: subscription?.subscriptionPlanId,
          isActive: false,
          startDate: LessThanOrEqual(now),
          endDate: MoreThan(now),
        },
        order: {
          createdAt: 'DESC',
        },
      });

    if (subscription && inactiveSubscriptionForRenew) {
      startDate = addDays(inactiveSubscriptionForRenew.endDate, 1);
    }

    return {
      packagestartdate: formatWithTimezone(startDate),
      packageenddate: formatWithTimezone(endDate),
      updatedatetime: formatWithTimezone(new Date()),
      senddatetime: formatWithTimezone(new Date()),
      skucode: subscriptionPlan.productId,
      skuname: subscriptionPlan.name,
    };
  }

  private getPaymentChannelByMerchantId(
    merchantId: string,
  ): CRM_PAYMENT_CHANNEL {
    switch (merchantId) {
      case this.configService.get('PAYMENT_2C2P_MERCHANT_ID'):
        return CRM_PAYMENT_CHANNEL.CREDIT_CARD;

      case this.configService.get('PAYMENT_2C2P_QR_MERCHANT_ID'):
        return CRM_PAYMENT_CHANNEL.QR;

      case this.configService.get('PAYMENT_2C2P_INSTALLMENT_MERCHANT_ID'):
        return CRM_PAYMENT_CHANNEL.CREDIT_CARD;

      default:
        return CRM_PAYMENT_CHANNEL.CREDIT_CARD;
    }
  }

  private async crmCouponDiscount(
    couponId: string,
    cartTotal: OrderMetadata,
  ): Promise<{
    discount: CRMContactRetailPaid['discount'];
    discountamount: CRMContactRetailPaid['discountamount'];
    coupon: CRMContactRetailPaid['coupon'];
    couponType: CRMContactRetailPaid['coupontype'];
  }> {
    const coupon = await this.couponDetailArRawRepository.findOneOrFail({
      id: couponId,
    });
    const couponInfo = await this.couponMasterArRawRepository.findOneOrFail({
      couponCode: coupon.couponCode,
    });
    const crmCouponPayload = {
      coupon: coupon.couponUniqueNo,
      couponType: '1',
    };
    const discountamount = Number(cartTotal.discount);
    let discountPayload = {
      discount: 0,
      discountamount,
    };
    if (couponInfo.discountUom === '%') {
      discountPayload = {
        discount: +couponInfo.promotion,
        discountamount,
      };
    } else if (couponInfo.discountUom === 'THB') {
      discountPayload = {
        discount: 0,
        discountamount,
      };
    }
    return {
      ...crmCouponPayload,
      ...discountPayload,
    };
  }
}
