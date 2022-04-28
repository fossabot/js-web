import { TestingModule } from '@nestjs/testing';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { validate } from 'class-validator';
import { EntityManager } from 'typeorm';
import { plainToClass } from 'class-transformer';
import numeral from 'numeral';
import { ConfigService } from '@nestjs/config';
import faker from 'faker';
import {
  beforeAllApp,
  beforeEachApp,
  afterEachApp,
  afterAllApp,
} from '../../utils/testHelpers/setup-integration';
import { CRMService } from '../crm.service';
import { CRMModule } from '../crm.module';
import { CorePaymentModule } from '../../payment/corePayment.module';
import { UsersModule } from '../../user/users.module';
import { Order, OrderStatus } from '../../payment/Order.entity';
import { UsersService } from '../../user/users.service';
import {
  SubscriptionPlan,
  SubscriptionPlanCategory,
} from '../../payment/SubscriptionPlan.entity';
import { CRMContactRetailPaidV11 } from './CRMContactRetailPaidV11';
import {
  CHANNEL_RESPONSE_CODE,
  PAYMENT_CHANNEL,
  PAYMENT_STATUS_RESPONSE_CODE,
} from '../payment';
import {
  OfficeType,
  TaxInvoice,
  TaxType,
} from '../../payment/TaxInvoice.entity';
import { addToDateByPlan } from '../../utils/date';
import { User } from '../../user/User.entity';
import { Gender } from '../../user/Gender.enum';
import placeholderGroupCompany from '../crm.constant';
import { Province } from '../../address/Province.entity';
import { District } from '../../address/District.entity';
import { Subdistrict } from '../../address/Subdistrict.entity';
import { Subscription } from '../../payment/Subscription.entity';
import { BillingAddress } from '../../payment/BillingAddress.entity';
import { encodeJson } from '../../utils/2c2p';
import { PaymentGatewayCallbackV4 } from '../../payment/PaymentGatewayCallbackV4';

const crmEndpointPath = 'http://example.com/fake/crm/path';
const server = setupServer(
  rest.post(crmEndpointPath, async (req, res, ctx) => {
    return res(
      ctx.json({
        ID: '6bb45920-3758-4093-8b54-186d9daeb454',
        'Date Import': '2021-05-13T07:58:03.4996484Z',
        Status: '200',
        Description: 'Receive Contact Paid Success',
      }),
    );
  }),
);

async function createOrder(app: TestingModule, issueTaxInvoice: boolean) {
  const user = await app.get(UsersService).createRandomUser();
  const entityManager = app.get(EntityManager);
  const orderRepository = entityManager.getRepository(Order);
  const subscriptionRepository = entityManager.getRepository(Subscription);
  const subscriptionPlanRepository =
    entityManager.getRepository(SubscriptionPlan);

  const subscriptionPlan = await subscriptionPlanRepository
    .create({
      name: 'subscription plan',
      productId: faker.datatype.uuid(),
      price: '1000',
      vatRate: '7',
      currency: 'THB',
      category: SubscriptionPlanCategory.LIFETIME,
      isPublic: false,
      allowRenew: false,
      isDefaultPackage: false,
    })
    .save();
  const order = await orderRepository
    .create({
      status: OrderStatus.COMPLETED,
      subscriptionPlan,
      issueTaxInvoice,
      userId: user.id,
      user,
      metaData: {
        grandTotal: 1070,
        subTotal: 1070,
        discount: 0,
        vat: 0,
        vatRate: 0,
        price: 1000,
      },
    })
    .save();
  const subscription = await subscriptionRepository
    .create({
      subscriptionPlan,
      user,
      order,
      endDate: addToDateByPlan(new Date(), subscriptionPlan),
      startDate: new Date(),
    })
    .save();

  return {
    user,
    subscription,
    subscriptionPlan,
    order,
  };
}

async function createAddress(app: TestingModule) {
  const entityManager = app.get(EntityManager);
  const [province, district, subdistrict] = await Promise.all([
    entityManager
      .getRepository(Province)
      .create({
        id: faker.datatype.number(),
        provinceCode: '0',
        provinceNameEn: 'en',
        provinceNameTh: 'th',
      })
      .save(),
    entityManager
      .getRepository(District)
      .create({
        id: faker.datatype.number(),
        provinceId: 0,
        districtCode: '0',
        districtNameEn: 'en',
        districtNameTh: 'th',
      })
      .save(),
    entityManager
      .getRepository(Subdistrict)
      .create({
        id: faker.datatype.number(),
        provinceId: 0,
        districtId: 0,
        subdistrictCode: '0',
        subdistrictNameEn: 'en',
        subdistrictNameTh: 'th',
        zipCode: '00000',
      })
      .save(),
  ]);

  return { province, district, subdistrict };
}

async function createTaxInvoice(
  app: TestingModule,
  order: Order,
  partial?: Partial<TaxInvoice>,
) {
  const { district, subdistrict, province } = await createAddress(app);
  const taxInvoice = await app
    .get(EntityManager)
    .getRepository(TaxInvoice)
    .create({
      taxType: TaxType.INDIVIDUAL,
      officeType: OfficeType.BRANCH,
      taxEntityName: 'john doe',
      taxId: '1111111111111',
      taxAddress: 'tax address',
      district,
      subdistrict,
      province,
      country: 'TH',
      zipCode: '00000',
      orderId: order.id,
      order,
      contactPerson: 'someone',
      contactPhoneNumber: '0811111111',
      contactEmail: 'johndoe@mail.com',
      ...partial,
    })
    .save();

  return taxInvoice;
}

function createPayment2c2pPayload(
  order: Order,
  subscriptionPlan: SubscriptionPlan,
): PaymentGatewayCallbackV4 {
  const price = parseFloat(subscriptionPlan.price);
  const vatRate = parseFloat(subscriptionPlan.vatRate);
  const amount2c2p = numeral(price * (1 + vatRate / 100)).value();

  return {
    invoiceNo: order.id,
    amount: amount2c2p!,
    currencyCode: subscriptionPlan.currency,
    tranRef: '1234567',
    approvalCode: '123456',
    transactionDateTime: '20210710210000',
    channelCode: 'VI',
    respCode: PAYMENT_STATUS_RESPONSE_CODE.PAYMENT_SUCCESSFUL,
    respDesc: 'description',
    merchantID: 'merchantId',
    recurringUniqueID: '',
    referenceNo: '4274514',
    agentCode: 'TBANK',
    issuerCountry: 'US',
    issuerBank: 'BANK',
    eci: '05',
    idempotencyID: '',
    paymentScheme: 'VI',
    userDefined1: encodeJson({
      subTotal: price.toString(),
      discount: '0',
      vat: (vatRate / 100) * price,
      vatRate: vatRate.toString(),
      grandTotal: amount2c2p?.toString(),
    }),
  };
}

async function createBillingAddress(
  app: TestingModule,
  user: User,
  partial?: Partial<BillingAddress>,
) {
  const { district, subdistrict, province } = await createAddress(app);
  const billingAddress = await app
    .get(EntityManager)
    .getRepository(BillingAddress)
    .create({
      billingAddress: 'somewhere',
      province,
      district,
      subdistrict,
      country: 'TH',
      user,
      isDefault: false,
      ...partial,
    })
    .save();

  return { billingAddress, district, subdistrict, province };
}

describe('CRMService', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await beforeAllApp(
      [CRMModule, CorePaymentModule, UsersModule],
      () => ({
        CRM_CONTACT_RETAIL_PAID_PATH: crmEndpointPath,
        SIGNATURE_CONTACT_RETAIL_PAID: '',
        PAYMENT_2C2P_MERCHANT_ID: '2c2pMerchantId',
        PAYMENT_2C2P_INSTALLMENT_MERCHANT_ID: '2c2pInstallmentMerchantId',
        PAYMENT_2C2P_QR_MERCHANT_ID: '2c2pQrMerchantId',
      }),
    );
    server.listen();
  });

  beforeEach(async () => {
    await beforeEachApp(app);
  });

  afterEach(async () => {
    await afterEachApp(app);
    server.resetHandlers();
  });

  afterAll(async () => {
    await afterAllApp(app);
    server.close();
  });

  describe('#createContactRetailPaid', () => {
    it('should have expected CRM.reforderid', async () => {
      const crmService = app.get(CRMService);
      const { order, subscriptionPlan, subscription } = await createOrder(
        app,
        false,
      );
      const payload = createPayment2c2pPayload(order, subscriptionPlan);

      const {
        config: { data: rawCrmPayload },
      } = await crmService.createContactRetailPaid(payload, subscription);
      const crmPayload = plainToClass(
        CRMContactRetailPaidV11,
        JSON.parse(rawCrmPayload),
      );

      expect(crmPayload.reforderid).toEqual(order.id);
    });

    it('should map to expected CRM.gender', async () => {
      const crmService = app.get(CRMService);
      const [
        { gender: crmGenderMale },
        { gender: crmGenderFemale },
        { gender: crmGenderOther },
      ] = await Promise.all<CRMContactRetailPaidV11>(
        [Gender.Male, Gender.Female, Gender.Other].map(async (gender) => {
          const { order, subscriptionPlan, user, subscription } =
            await createOrder(app, false);
          user.gender = gender;
          await user.save();
          const payload = createPayment2c2pPayload(order, subscriptionPlan);

          const res = await crmService.createContactRetailPaid(
            payload,
            subscription,
          );
          return JSON.parse(res.config.data);
        }),
      );

      expect(crmGenderMale).toEqual('M');
      expect(crmGenderFemale).toEqual('F');
      expect(crmGenderOther).toBeUndefined();
    });

    it('should map to expected CRM.paymentchannel', async () => {
      const crmService = app.get(CRMService);
      const { order, subscriptionPlan, subscription } = await createOrder(
        app,
        false,
      );
      const payload = createPayment2c2pPayload(order, subscriptionPlan);

      const [
        { paymentchannel: merchantMainPaymentChannel },
        { paymentchannel: merchantInstallmentPaymentChannel },
        { paymentchannel: merchantQrPaymentChannel },
        { paymentchannel: externalMerchantPaymentChannel },
      ] = await Promise.all<CRMContactRetailPaidV11>(
        [
          app.get(ConfigService).get('PAYMENT_2C2P_MERCHANT_ID'),
          app.get(ConfigService).get('PAYMENT_2C2P_INSTALLMENT_MERCHANT_ID'),
          app.get(ConfigService).get('PAYMENT_2C2P_QR_MERCHANT_ID'),
          'external merchant id',
        ].map(async (merchantID) => {
          const res = await crmService.createContactRetailPaid(
            {
              ...payload,
              merchantID,
            },
            subscription,
          );
          return JSON.parse(res.config.data);
        }),
      );

      expect(merchantMainPaymentChannel).toEqual('4');
      expect(merchantInstallmentPaymentChannel).toEqual('4');
      expect(merchantQrPaymentChannel).toEqual('5');
      expect(externalMerchantPaymentChannel).toEqual('4');
    });

    it('should map to expected CRM.paymentstatus', async () => {
      const crmService = app.get(CRMService);
      const { order, subscriptionPlan, subscription } = await createOrder(
        app,
        false,
      );
      const payload = createPayment2c2pPayload(order, subscriptionPlan);

      const [
        { paymentstatus: success },
        { paymentstatus: pending },
        { paymentstatus: failed },
        { paymentstatus: canceled },
      ] = await Promise.all<CRMContactRetailPaidV11>(
        [
          PAYMENT_STATUS_RESPONSE_CODE.PAYMENT_SUCCESSFUL,
          PAYMENT_STATUS_RESPONSE_CODE.PAYMENT_PENDING,
          PAYMENT_STATUS_RESPONSE_CODE.PAYMENT_FAILED,
          PAYMENT_STATUS_RESPONSE_CODE.PAYMENT_FAILED,
        ].map(async (payment_status) => {
          const res = await crmService.createContactRetailPaid(
            {
              ...payload,
              respCode: payment_status,
            },
            subscription,
          );
          return JSON.parse(res.config.data);
        }),
      );

      expect(success).toEqual('1');
      expect(pending).toEqual('1');
      expect(failed).toEqual('2');
      expect(canceled).toEqual('2');
    });

    it('without taxinvoice, should comply with CRM spec', async () => {
      const crmService = app.get(CRMService);
      const { order, subscriptionPlan, subscription } = await createOrder(
        app,
        false,
      );
      const payload = createPayment2c2pPayload(order, subscriptionPlan);

      const {
        config: { data: rawCrmPayload },
      } = await crmService.createContactRetailPaid(payload, subscription);
      const crmPayload = plainToClass(
        CRMContactRetailPaidV11,
        JSON.parse(rawCrmPayload),
      );
      const validationErrors = await validate(crmPayload);

      expect(validationErrors).toEqual([]);
    });

    it('with taxinvoice, should have CRM.fulltaxrequest = true', async () => {
      const crmService = app.get(CRMService);
      const { order, subscriptionPlan, subscription } = await createOrder(
        app,
        true,
      );
      await createTaxInvoice(app, order);
      const payload = createPayment2c2pPayload(order, subscriptionPlan);

      const {
        config: { data: rawCrmPayload },
      } = await crmService.createContactRetailPaid(payload, subscription);

      expect(JSON.parse(rawCrmPayload).fulltaxrequest).toEqual(true);
    });

    it('with taxinvoice, should map CRM.fulltaxtype to expected value', async () => {
      const crmService = app.get(CRMService);
      const [
        { fulltaxtype: taxTypeIndividual },
        { fulltaxtype: taxTypeOrganization },
      ] = await Promise.all<CRMContactRetailPaidV11>(
        [TaxType.INDIVIDUAL, TaxType.ORGANIZATION].map(async (taxType) => {
          const { order, subscriptionPlan, subscription } = await createOrder(
            app,
            true,
          );
          await createTaxInvoice(app, order, { taxType });

          const payload = createPayment2c2pPayload(order, subscriptionPlan);
          const res = await crmService.createContactRetailPaid(
            payload,
            subscription,
          );

          return JSON.parse(res.config.data);
        }),
      );

      expect(taxTypeIndividual).toEqual('1');
      expect(taxTypeOrganization).toEqual('2');
    });

    it('with taxinvoice, same billing, should comply with crm spec', async () => {
      const crmService = app.get(CRMService);
      const { order, subscriptionPlan, subscription } = await createOrder(
        app,
        true,
      );
      await createTaxInvoice(app, order);
      const payload = createPayment2c2pPayload(order, subscriptionPlan);

      const {
        config: { data: rawCrmPayload },
      } = await crmService.createContactRetailPaid(payload, subscription);
      const crmPayload = plainToClass(
        CRMContactRetailPaidV11,
        JSON.parse(rawCrmPayload),
      );
      const validationErrors = await validate(crmPayload);

      expect(validationErrors).toEqual([]);
    });

    it('with taxinvoice, new billing, should comply with crm spec', async () => {
      const crmService = app.get(CRMService);
      const { order, subscriptionPlan, user, subscription } = await createOrder(
        app,
        true,
      );
      const { billingAddress } = await createBillingAddress(app, user);
      await createTaxInvoice(app, order, { billingAddress });
      const payload = createPayment2c2pPayload(order, subscriptionPlan);

      const {
        config: { data: rawCrmPayload },
      } = await crmService.createContactRetailPaid(payload, subscription);
      const crmPayload = plainToClass(
        CRMContactRetailPaidV11,
        JSON.parse(rawCrmPayload),
      );
      const validationErrors = await validate(crmPayload);

      expect(validationErrors).toEqual([]);
    });

    it('with memberid, with groupcompany, should comply with crm spec', async () => {
      const crmService = app.get(CRMService);
      const { order, subscriptionPlan, user, subscription } = await createOrder(
        app,
        false,
      );
      await app
        .get(EntityManager)
        .getRepository(User)
        .update({ id: user.id }, { seacId: 'M001' });
      const payload = createPayment2c2pPayload(order, subscriptionPlan);

      const {
        config: { data: rawCrmPayload },
      } = await crmService.createContactRetailPaid(payload, subscription);
      const crmPayload = plainToClass(
        CRMContactRetailPaidV11,
        JSON.parse(rawCrmPayload),
      );
      const validationErrors = await validate(crmPayload);

      expect(crmPayload.memberid).toEqual('M001');
      expect(crmPayload.groupcompany).toEqual(placeholderGroupCompany);
      expect(validationErrors).toEqual([]);
    });
  });
});
