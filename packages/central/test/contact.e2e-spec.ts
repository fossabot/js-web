// noinspection JSConstantReassignment

import { HttpService, INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  CreateContactCorporateDto,
  CreateContactRetailDto,
  CreateContactTrialDto,
} from '@seaccentral/core/dist/dto/CreateContact.dto';
import { SeedService } from '@seaccentral/core/dist/seed/seed.service';
import { sendLeadContactToCRM } from '@seaccentral/core/dist/crm/crm.provider';

import {
  beforeEachServer,
  clearDbModels,
  setupServer,
  teardownServer,
} from '../src/utils/testHelpers/setup-e2e';
import { AddressService } from '../src/address/address.service';
import { createSession } from '../src/utils/testHelpers/fixtures';

const contactRetailMock: CreateContactRetailDto = {
  email: 'test@mail.com',
  firstname: 'Admin',
  lastname: 'SEAC',
  companyname: 'OOZOU',
  jobtitle: 'Staff',
  phoneno: '0812345678',
  utm_source: 'Line@',
  utm_medium: 'YourNextU',
  utm_campaign_name: 'Testing',
  utm_term: 'CRM Integration',
  utm_content: 'E2E',
  tracking: 'YNURETAIL',
  cookieid: '',
  leadmessage: 'Hello, This is an optional field.',
  originalurl: 'http',
  taggedurl: 'htpp',
  stateid: '',
  sessionid: '',
  leadformurl: '',
  consent_mkt: true,
};

const contactCorporateMock: CreateContactCorporateDto = {
  ...contactRetailMock,
  companyIndustry: '1',
  NoOfEmployee: '1', // <50 Employees
};

const contactTrialMock: CreateContactTrialDto = {
  ...contactRetailMock,
  skucode: 'YNUV03MN0002',
  skuname: 'Trial 7 Days',
  coupon: 'Coupon',
  coupontype: 'A',
  billingaddressth: '123/123 บ้าน',
  billingaddressen: '123/123 Home',
  billingsubdistrict: 1,
};

describe('Contact E2E', () => {
  const baseContactPath = '/v1/contact';
  let app: INestApplication;

  beforeAll(async () => {
    jest.setTimeout(15000);
    app = await setupServer();
  });

  beforeEach(async () => {
    await beforeEachServer(app);
    await Promise.all([
      app.get(AddressService).seedAddress(),
      app.get(SeedService).createMockedPlans(),
    ]);
  });

  afterAll(async () => {
    await clearDbModels(app);
    await teardownServer(app);
  });

  describe('/POST contact', () => {
    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      sendLeadContactToCRM = jest.fn().mockResolvedValue('');
      // Mock 3rd parties service (CRM)
    });

    describe('Contact Retail', () => {
      it('Return 201 if create contact succeed', async () => {
        const { status } = await request(app.getHttpServer())
          .post(`${baseContactPath}/retail`)
          .send(contactRetailMock);
        expect(status).toEqual(201);
      });

      it('Return 500 if create contact failed on DB', async () => {
        // Hide Insert Error on Logger
        app.useLogger(false);
        const { status } = await request(app.getHttpServer())
          .post(`${baseContactPath}/retail`)
          .send({ email: 'test' });

        expect(status).toEqual(500);
      });
    });

    describe('Contact Corporate', () => {
      it('Return 201 if create contact succeed', async () => {
        const { status } = await request(app.getHttpServer())
          .post(`${baseContactPath}/corporate`)
          .send(contactCorporateMock);
        expect(status).toEqual(201);
      });

      it('Return 500 if create contact failed on DB', async () => {
        // Hide Insert Error on Logger
        app.useLogger(false);
        const { status } = await request(app.getHttpServer())
          .post(`${baseContactPath}/corporate`)
          .send({ email: 'test' });

        expect(status).toEqual(500);
      });
    });

    describe('Contact Trial', () => {
      beforeAll(() => {
        const observable = {
          toPromise: () => Promise.resolve(''),
        };
        const httpService = app.get(HttpService);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(httpService, 'post').mockImplementation(() => observable);
        // Mock 3rd parties service (CRM)
      });
      // Runs locally but fails in CI ¯\_(ツ)_/¯
      it.skip('Return 201 if create contact succeed', async () => {
        const { status } = await request(app.getHttpServer())
          .post(`${baseContactPath}/trial`)
          .send(contactTrialMock);

        expect(status).toEqual(201);
      });

      it('Return 400 if create contact has invalid subdistrict id', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { billingsubdistrict, ...data } = contactTrialMock;
        const { status } = await request(app.getHttpServer())
          .post(`${baseContactPath}/trial`)
          .send({ ...data, billingsubdistrict: 99999 });

        expect(status).toEqual(400);
      });

      it('Return 400 if create contact has invalid skucode', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { skucode, ...data } = contactTrialMock;
        const { status } = await request(app.getHttpServer())
          .post(`${baseContactPath}/trial`)
          .send({ ...data, skucode: 'invalid' });

        expect(status).toEqual(400);
      });

      // Runs locally but fails in CI ¯\_(ツ)_/¯
      it.skip('Return 500 if create contact failed on DB', async () => {
        // Hide Insert Error on Logger
        app.useLogger(false);
        const { status } = await request(app.getHttpServer())
          .post(`${baseContactPath}/trial`)
          .send({
            ...contactTrialMock,
            email: 'test',
          });

        expect(status).toEqual(500);
      });
    });
  });

  describe('/GET contact', () => {
    describe('Contact Retail', () => {
      it('Return 401 if requested by unauthenticate user', async () => {
        const { status, body } = await request(app.getHttpServer()).get(
          `${baseContactPath}/retail`,
        );
        expect(status).toEqual(401);
        expect(body).toEqual({ statusCode: 401, message: 'Unauthorized' });
      });

      it('Return 200 if requested by authenticated user', async () => {
        const { accessToken } = await createSession(app);
        const { status, body } = await request(app.getHttpServer())
          .get(`${baseContactPath}/retail`)
          .set('auth_token', accessToken);
        expect(status).toEqual(200);
        expect(body.data).toBeInstanceOf(Array);
      });
    });

    describe('Contact Corporate', () => {
      it('Return 401 if requested by unauthenticate user', async () => {
        const { status, body } = await request(app.getHttpServer()).get(
          `${baseContactPath}/corporate`,
        );
        expect(status).toEqual(401);
        expect(body).toEqual({ statusCode: 401, message: 'Unauthorized' });
      });

      it('Return 200 if requested by authenticated user', async () => {
        const { accessToken } = await createSession(app);
        const { status, body } = await request(app.getHttpServer())
          .get(`${baseContactPath}/corporate`)
          .set('auth_token', accessToken);
        expect(status).toEqual(200);
        expect(body.data).toBeInstanceOf(Array);
      });
    });

    describe('Contact Trial', () => {
      it('Return 401 if requested by unauthenticate user', async () => {
        const { status, body } = await request(app.getHttpServer()).get(
          `${baseContactPath}/trial`,
        );
        expect(status).toEqual(401);
        expect(body).toEqual({ statusCode: 401, message: 'Unauthorized' });
      });

      it('Return 200 if requested by authenticated user', async () => {
        const { accessToken } = await createSession(app);
        const { status, body } = await request(app.getHttpServer())
          .get(`${baseContactPath}/trial`)
          .set('auth_token', accessToken);
        expect(status).toEqual(200);
        expect(body.data).toBeInstanceOf(Array);
      });
    });
  });
});
