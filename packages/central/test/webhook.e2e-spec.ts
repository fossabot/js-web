import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { EntityManager } from 'typeorm';
import { User } from '@seaccentral/core/dist/user/User.entity';
import {
  SubscriptionPlan,
  SubscriptionPlanCategory,
} from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { UserThirdParty } from '@seaccentral/core/dist/user/UserThirdParty.entity';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { UserThirdPartyType } from '@seaccentral/core/dist/user/UserThirdPartyType.enum';
import { setupServer as setupMswServer } from 'msw/node';
import { ProductArRaw } from '@seaccentral/core/dist/raw-product/ProductArRaw.entity';
import { NewMemberDto } from '../src/webhook/dto/NewMember.dto';
import {
  beforeEachServer,
  setupServer,
  teardownServer,
} from '../src/utils/testHelpers/setup-e2e';
import { UpdateMemberDto } from '../src/webhook/dto/UpdateMember.dto';
import * as instancyApi from '../src/utils/testHelpers/instancy-endpoints';

const server = setupMswServer(
  ...instancyApi.apiC23,
  ...instancyApi.apiPkgAllAccess,
  ...instancyApi.apiPkgOnline,
  ...instancyApi.apiPkgVirtual,
);
function newMemberPayload(extra?: Partial<NewMemberDto>): NewMemberDto {
  return {
    Name: 'เทส',
    Lastname: 'ภาษาไทย',
    Phone: '0811562685',
    Email: 'test@mail.com',
    CompanyName: 'SEAC',
    SkuCode: 'YNU-Full-12M',
    StartPackage: '2021-04-30 00:00:01+07:00',
    EndPackage: '2022-04-30 23:00:59+07:00',
    MemberType: 'Premium',
    DealId: 'SEAC-Deal-001',
    InvoiceNumber: 'Invoice-0001',
    AmendmentStatus: 'New',
    SaleOrderID: 'SEAC-001',
    Company: 'SEACCOM',
    Department: 'Digital',
    BatchName: 'Batch-00001',
    SEACID: 'seac1',
    ...extra,
  };
}

function updateMemberPayload(
  extra?: Partial<UpdateMemberDto>,
): UpdateMemberDto {
  return {
    SkuCode: 'YNU-Full-12M',
    StartPackage: '2021-04-30 00:00:01+07:00',
    EndPackage: '2022-04-30 23:00:59+07:00',
    DealId: '',
    InvoiceNumber: '',
    AmendmentStatus: '',
    SaleOrderID: '',
    OrganizationID: '',
    Company: '',
    Department: '',
    BatchName: '',
    Method: 0,
    SEACID: 'seac1',
    ...extra,
  };
}

function createSubscriptionPlan(
  app: INestApplication,
  subscriptionPlan: Partial<SubscriptionPlan>,
) {
  const subscriptionPlanRepository = app
    .get(EntityManager)
    .getRepository(SubscriptionPlan);
  const productArRawRepository = app
    .get(EntityManager)
    .getRepository(ProductArRaw);

  return subscriptionPlanRepository.save({
    productSKU: productArRawRepository.create({
      productGroup: '',
      subProductGroup: '',
      partner: '',
      deliveryFormat: '',
      itemCategory: '',
      no: subscriptionPlan.productId,
      description: '',
      periodYear: 0,
      periodMonth: 0,
      periodDay: 0,
      baseUnitOfMeasure: '',
      unitPrice: '',
      currency: '',
      countryRegionOfOriginCode: '',
      productAvailability: '',
      shelfLife: '',
      revenueType: '',
      thirdPartyLicenseFee: '',
    }),
    ...subscriptionPlan,
  });
}

describe('WebhookController (e2e)', () => {
  let app: INestApplication;
  const basePath = '/v1/webhook';
  const crmToken = process.env.X_CRM_TOKEN as string;

  beforeAll(async () => {
    app = await setupServer();
    server.listen();
  });

  beforeEach(async () => {
    await beforeEachServer(app);
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(async () => {
    await teardownServer(app);
    server.close();
  });

  it('As a CRM, I should be able to create a new member', async () => {
    const payload = newMemberPayload();
    const subscriptionPlan = await createSubscriptionPlan(app, {
      name: 'subscription',
      productId: payload.SkuCode,
      price: '9.99',
      currency: 'thb',
      category: SubscriptionPlanCategory.SUBSCRIPTION,
    });
    await request(app.getHttpServer())
      .post(`${basePath}/crm/member`)
      .send(payload)
      .set('x-crm-token', crmToken)
      .expect(HttpStatus.CREATED);

    const user = await app
      .get(EntityManager)
      .getRepository(User)
      .findOneOrFail({ seacId: payload.SEACID });
    await app
      .get(EntityManager)
      .getRepository(UserThirdParty)
      .findOneOrFail({ userThirdPartyId: payload.SEACID });
    await app.get(EntityManager).getRepository(Subscription).findOneOrFail({
      startDate: payload.StartPackage,
      endDate: payload.EndPackage,
      subscriptionPlan,
      user,
    });
  });

  it('As a CRM, I should be able to create a new corporate member', async () => {
    const organization = await app
      .get(EntityManager)
      .getRepository(Organization)
      .save({
        name: 'mycorp',
        slug: 'mycorp',
      });
    const payload = newMemberPayload({ OrganizationID: organization.id });
    const subscriptionPlan = await createSubscriptionPlan(app, {
      name: 'subscription',
      productId: payload.SkuCode,
      price: '9.99',
      currency: 'thb',
      category: SubscriptionPlanCategory.SUBSCRIPTION,
    });
    await request(app.getHttpServer())
      .post(`${basePath}/crm/member`)
      .send(payload)
      .set('x-crm-token', crmToken)
      .expect(HttpStatus.CREATED);

    const user = await app
      .get(EntityManager)
      .getRepository(User)
      .findOneOrFail({ seacId: payload.SEACID });
    await app
      .get(EntityManager)
      .getRepository(UserThirdParty)
      .findOneOrFail({ userThirdPartyId: payload.SEACID });
    await app.get(EntityManager).getRepository(Subscription).findOneOrFail({
      startDate: payload.StartPackage,
      endDate: payload.EndPackage,
      subscriptionPlan,
      user,
    });
    await app
      .get(EntityManager)
      .getRepository(OrganizationUser)
      .findOneOrFail({ user, organization });
  });

  it('as a CRM user, I should be able to assign a new subscription with my subscription plan to existing user', async () => {
    const user = await app.get(EntityManager).getRepository(User).save({
      firstName: 'john',
      lastName: 'doe',
      email: 'john.doe@yopmail.com',
      seacId: 'seac1',
    });
    await app.get(EntityManager).getRepository(UserThirdParty).save({
      userThirdPartyId: 'seac1',
      userThirdPartyType: UserThirdPartyType.CRM,
      user,
    });
    const payload = updateMemberPayload({ Method: 0 });
    const subscriptionPlan = await createSubscriptionPlan(app, {
      name: 'subscription',
      productId: payload.SkuCode,
      price: '9.99',
      currency: 'thb',
      category: SubscriptionPlanCategory.SUBSCRIPTION,
    });

    await request(app.getHttpServer())
      .put(`${basePath}/crm/member`)
      .set('x-crm-token', crmToken)
      .send(payload)
      .expect(HttpStatus.OK);

    await app.get(EntityManager).getRepository(Subscription).findOneOrFail({
      subscriptionPlan,
      user,
    });
  });

  it('as a CRM user, I should be able to extend subscription period to existing user', async () => {
    const user = await app.get(EntityManager).getRepository(User).save({
      firstName: 'john',
      lastName: 'doe',
      email: 'john.doe@yopmail.com',
      seacId: 'seac1',
    });
    await app.get(EntityManager).getRepository(UserThirdParty).save({
      userThirdPartyId: 'seac1',
      userThirdPartyType: UserThirdPartyType.CRM,
      user,
    });
    const payload = updateMemberPayload({ Method: 1 });
    const subscriptionPlan = await createSubscriptionPlan(app, {
      name: 'subscription',
      productId: payload.SkuCode,
      price: '9.99',
      currency: 'thb',
      category: SubscriptionPlanCategory.SUBSCRIPTION,
    });
    await app.get(EntityManager).getRepository(Subscription).insert({
      startDate: new Date(),
      endDate: new Date(),
      subscriptionPlan,
      user,
    });

    await request(app.getHttpServer())
      .put(`${basePath}/crm/member`)
      .set('x-crm-token', crmToken)
      .send(payload)
      .expect(HttpStatus.OK);

    await app.get(EntityManager).getRepository(Subscription).findOneOrFail({
      user,
      subscriptionPlan,
      startDate: payload.StartPackage,
      endDate: payload.EndPackage,
    });
  });
});
