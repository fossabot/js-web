import { HttpStatus, INestApplication } from '@nestjs/common';
import { Industry } from '@seaccentral/core/dist/user/Industry.entity';
import { CompanySizeRange } from '@seaccentral/core/dist/user/Range.entity';
import request from 'supertest';
import { EntityManager } from 'typeorm';
import { rest } from 'msw';
import { setupServer as setupMswServer } from 'msw/node';
import { URL, format } from 'url';
import {
  beforeEachServer,
  setupServer,
  teardownServer,
} from '../src/utils/testHelpers/setup-e2e';
import { createSession } from '../src/utils/testHelpers/fixtures';

const crmEndpointPath = format(
  new URL(process.env.CRM_UPDATE_MEMBER_PATH as string),
  {
    search: false,
  },
);
const server = setupMswServer(
  rest.post(crmEndpointPath, async (req, res, ctx) => {
    return res(
      ctx.json({
        ID: '6bb45920-3758-4093-8b54-186d9daeb454',
        'Date Import': '2021-05-13T07:58:03.4996484Z',
        Status: '200',
        Description: 'Receive Contact Success',
      }),
    );
  }),
);

describe('ProfileController (e2e)', () => {
  let app: INestApplication;
  const basePath = '/v1/profile';

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

  it('As a user, I can get my profile information', async () => {
    const { accessToken } = await createSession(app);
    const { status, body } = await request(app.getHttpServer())
      .get(basePath)
      .set('auth_token', accessToken);

    expect(status).toEqual(HttpStatus.OK);
    expect(body.data).toBeDefined();
  });

  it('As a user, I can unset my optional profile information fields', async () => {
    const requiredFields = {
      phoneNumber: '0811111111',
      firstName: 'john',
      lastName: 'doe',
    };
    const optionalFields = {
      title: null,
      gender: null,
      dob: null,
      dobVisible: false,
      lineId: null,
      lineIdVisible: false,
      jobTitle: null,
      department: null,
      companyName: null,
      companySizeRange: null,
      industry: null,
      shortSummary: null,
      bio: null,
      experience: null,
    };
    const { accessToken } = await createSession(app);
    const { status, body } = await request(app.getHttpServer())
      .put(basePath)
      .send({ ...requiredFields, ...optionalFields })
      .set('auth_token', accessToken);

    expect(status).toEqual(HttpStatus.OK);
    expect(body.data).toMatchObject(optionalFields);
  });

  it('As a user, I can set my optional profile information fields', async () => {
    const softwareIndustry = await app
      .get(EntityManager)
      .getRepository(Industry)
      .create({ nameEn: 'software', nameTh: 'ซอฟต์แวร์' })
      .save();
    const smallCompanySizeRange = await app
      .get(EntityManager)
      .getRepository(CompanySizeRange)
      .create({
        start: 0,
        end: 0,
        nameEn: 'small',
        nameTh: 'เล็ก',
      })
      .save();
    const fields = {
      phoneNumber: '0811111111',
      title: 'mr',
      gender: 'male',
      firstName: 'john',
      lastName: 'doe',
      dob: '2021-06-23T05:30:15.180Z',
      dobVisible: false,
      lineId: 'john.deo',
      lineIdVisible: false,
      jobTitle: 'engineer',
      department: 'r&d',
      companyName: 'my company',
      companySizeRange: smallCompanySizeRange.id,
      industry: softwareIndustry.id,
      shortSummary: null,
      bio: null,
      experience: null,
    };
    const { accessToken } = await createSession(app);
    const { status, body } = await request(app.getHttpServer())
      .put(basePath)
      .send(fields)
      .set('auth_token', accessToken);

    expect(status).toEqual(HttpStatus.OK);
    expect(body.data).toMatchObject({
      ...fields,
      companySizeRange: { id: smallCompanySizeRange.id },
      industry: { id: softwareIndustry.id },
    });
  });

  it.todo('As a user, I can upload my profile picture');
});
