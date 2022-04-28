import faker from 'faker';
import { addDays } from 'date-fns';
import { INestApplication } from '@nestjs/common';
import {
  Order,
  OrderStatus,
} from '@seaccentral/core/dist/payment/Order.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import {
  DurationInterval,
  InstancyPackageType,
  SubscriptionPlan,
  SubscriptionPlanCategory,
} from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { find } from 'lodash';
import { ProductArRaw } from '@seaccentral/core/dist/raw-product/ProductArRaw.entity';
import { PeriodQuery } from '../period-query.dto';
import { OrderSummaryService } from '../order-summary.service';
import { setupServer, teardownServer } from '../../lib/testHelpers/setup-e2e';

async function createSubscriptionPlan(
  subscriptionOverride?: Partial<SubscriptionPlan>,
) {
  const subscriptionPlan = new SubscriptionPlan();
  const productSku = new ProductArRaw();
  productSku.productGroup = '';
  productSku.subProductGroup = '';
  productSku.partner = '';
  productSku.deliveryFormat = '';
  productSku.itemCategory = '';
  productSku.no = faker.random.alphaNumeric(8);
  productSku.description = '';
  productSku.periodYear = 0;
  productSku.periodMonth = 0;
  productSku.periodDay = 0;
  productSku.baseUnitOfMeasure = '';
  productSku.unitPrice = '0.00';
  productSku.currency = '';
  productSku.countryRegionOfOriginCode = '';
  productSku.productAvailability = '';
  productSku.shelfLife = '';
  productSku.revenueType = '';
  productSku.thirdPartyLicenseFee = '';

  subscriptionPlan.productId = faker.random.alphaNumeric(8);
  subscriptionPlan.productSKU = productSku;
  subscriptionPlan.category = SubscriptionPlanCategory.SUBSCRIPTION;
  subscriptionPlan.name = faker.commerce.product();
  subscriptionPlan.price = faker.commerce.price();
  subscriptionPlan.currency = faker.finance.currencyCode();
  subscriptionPlan.siteUrl = faker.internet.url();
  subscriptionPlan.siteId = faker.random.alphaNumeric(8);
  subscriptionPlan.packageType = InstancyPackageType.ONLINE;
  subscriptionPlan.durationValue = faker.datatype.number({ min: 1, max: 12 });
  subscriptionPlan.durationInterval = DurationInterval.DAY;
  subscriptionPlan.periodDay = 0;
  subscriptionPlan.periodMonth = 0;
  subscriptionPlan.periodYear = 0;
  subscriptionPlan.memberType = 'new';

  const savedSubscriptionPlan = Object.assign(
    subscriptionPlan,
    subscriptionOverride,
  );
  await subscriptionPlan.save();

  return savedSubscriptionPlan;
}

async function createFakeOrder(
  user: User,
  orderOverride?: Partial<Order>,
  subscriptionPlan?: SubscriptionPlan,
) {
  const plan = subscriptionPlan || (await createSubscriptionPlan());
  const order = new Order();
  order.planId = plan.productId;
  order.subscriptionPlan = plan;
  order.user = user;
  order.issueTaxInvoice = false;

  const saved = await Object.assign(order, orderOverride).save();

  return {
    order: saved,
    subscriptionPlan,
  };
}

async function createOutOfRangeOrder(
  user: User,
  period: PeriodQuery,
  order?: Partial<Order>,
) {
  return Promise.all([
    createFakeOrder(user, {
      status: OrderStatus.COMPLETED,
      ...order,
      createdAt: addDays(period.fromDate, -1),
    }),
    createFakeOrder(user, {
      status: OrderStatus.COMPLETED,
      ...order,
      createdAt: addDays(period.toDate, 1),
    }),
  ]);
}

describe('OrderSummaryService,TypeORM,Postgres', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await setupServer();
  });

  afterEach(async () => {
    await teardownServer(app);
  });

  describe('#newUser', () => {
    it('returns user who has order with one subscription in expected period range', async () => {
      const startDate = new Date(2021, 1, 1);
      const period = new PeriodQuery();
      period.fromDate = addDays(startDate, -1);
      period.toDate = addDays(startDate, 1);
      const [user1, user2] = await Promise.all([
        app.get(UsersService).createRandomUser(),
        app.get(UsersService).createRandomUser(),
      ]);

      await Promise.all([
        createFakeOrder(user1, {
          status: OrderStatus.COMPLETED,
          createdAt: startDate,
        }),
        createFakeOrder(user1, {
          status: OrderStatus.COMPLETED,
          createdAt: startDate,
        }),
        createFakeOrder(user2, {
          status: OrderStatus.COMPLETED,
          createdAt: startDate,
        }),
        createOutOfRangeOrder(user1, period),
      ]);

      const result = await app.get(OrderSummaryService).newUser(period);

      expect(result.length).toEqual(2);
      expect(find(result, { userId: user1.id })).toBeDefined();
      expect(find(result, { userId: user2.id })).toBeDefined();
    });
  });

  describe('#renewUser', () => {
    it('returns user who has order with > 1 same subscription in expected period range', async () => {
      const startDate = new Date(2021, 1, 1);
      const period = new PeriodQuery();
      period.fromDate = addDays(startDate, -1);
      period.toDate = addDays(startDate, 1);
      const [user1, user2] = await Promise.all([
        app.get(UsersService).createRandomUser(),
        app.get(UsersService).createRandomUser(),
      ]);

      const user1SubscriptionPlan = await createSubscriptionPlan();
      await Promise.all([
        createFakeOrder(
          user1,
          { status: OrderStatus.COMPLETED, createdAt: startDate },
          user1SubscriptionPlan,
        ),
        createFakeOrder(
          user1,
          { status: OrderStatus.COMPLETED, createdAt: startDate },
          user1SubscriptionPlan, // subscribe to same subscription = renew subscription
        ),
        createFakeOrder(user1, {
          status: OrderStatus.COMPLETED,
          createdAt: startDate,
        }),
        createFakeOrder(user2, {
          status: OrderStatus.COMPLETED,
          createdAt: startDate,
        }),
        createOutOfRangeOrder(user1, period),
      ]);

      const result = await app.get(OrderSummaryService).renewUser(period);

      expect(result.length).toEqual(1);
      expect(
        find(result, { userId: user1.id, totalSubscription: 2 }),
      ).toBeDefined();
      expect(find(result, { userId: user2.id })).toBeUndefined();
    });
  });

  describe('#expiredSubscription', () => {
    it('returns expired subscription in expected period range', async () => {
      const startDate = new Date(2021, 1, 1);
      const period = new PeriodQuery();
      period.fromDate = addDays(startDate, -366);
      period.toDate = addDays(startDate, 366);
      const [userWithValidPlan, userWithExpiredPlan, user] = await Promise.all([
        app.get(UsersService).createRandomUser(),
        app.get(UsersService).createRandomUser(),
        app.get(UsersService).createRandomUser(),
      ]);
      await Promise.all([
        createFakeOrder(
          userWithExpiredPlan,
          { status: OrderStatus.COMPLETED, createdAt: addDays(startDate, -2) },
          await createSubscriptionPlan({
            periodDay: 1,
          }),
        ),
        createFakeOrder(
          userWithValidPlan,
          { status: OrderStatus.COMPLETED },
          await createSubscriptionPlan({
            periodDay: 999,
          }),
        ),
        createOutOfRangeOrder(user, period),
      ]);
      const result = await app
        .get(OrderSummaryService)
        .expiredSubscription(period);

      expect(result.length).toBe(1);
      expect(
        find(result, { userId: userWithExpiredPlan.id, totalSubscription: 1 }),
      ).toBeDefined();
    });
  });

  describe('#unsuccessfulPayment', () => {
    it('count only failed transaction in expected period range', async () => {
      const period = new PeriodQuery();
      const user = await app.get(UsersService).createRandomUser();
      const [failedTransaction, canceledTransaction] = await Promise.all([
        createFakeOrder(user, {
          status: OrderStatus.FAILED,
        }),
        createFakeOrder(user, {
          status: OrderStatus.CANCELED,
        }),
        createFakeOrder(user, {
          status: OrderStatus.PAID,
        }),
        createFakeOrder(user, {
          status: OrderStatus.PENDING,
        }),
        createFakeOrder(user, {
          status: OrderStatus.COMPLETED,
        }),

        createOutOfRangeOrder(user, period),
      ]);

      const result = await app
        .get(OrderSummaryService)
        .unsuccessfulPayment(period);

      expect(result.length).toBe(2);
      expect(find(result, { id: failedTransaction.order.id })).toBeDefined();
      expect(find(result, { id: canceledTransaction.order.id })).toBeDefined();
    });
  });
});
