import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { EntityManager } from 'typeorm';
import { BillingAddress } from '@seaccentral/core/dist/payment/BillingAddress.entity';
import { createSession } from '../src/utils/testHelpers/fixtures';
import {
  beforeEachServer,
  setupServer,
  teardownServer,
} from '../src/utils/testHelpers/setup-e2e';
import {
  createAddress,
  createBillingAddress,
} from '../src/billing-address/test-utils/address-setup';

describe('BillingAddressController (e2e)', () => {
  let app: INestApplication;
  const basePath = '/v1/billing-address';

  beforeAll(async () => {
    app = await setupServer();
  });

  beforeEach(async () => {
    await beforeEachServer(app);
  });

  afterAll(async () => {
    await teardownServer(app);
  });

  it('As a user, I should be able to see my billing address', async () => {
    const { accessToken, user } = await createSession(app);
    await createBillingAddress(app, user);
    const { body } = await request(app.getHttpServer())
      .get(`${basePath}/me`)
      .set('auth_token', accessToken)
      .expect(HttpStatus.OK);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('As a user, I should be able to update my billing address', async () => {
    const { accessToken } = await createSession(app);
    const { district, subdistrict, province } = await createAddress(app);
    const payload = {
      billingAddress: 'billingAddress',
      districtId: district.id,
      subdistrictId: subdistrict.id,
      provinceId: province.id,
      country: 'country',
    };

    const { body: createdBody } = await request(app.getHttpServer())
      .put(`${basePath}/me`)
      .send(payload)
      .set('auth_token', accessToken)
      .expect(HttpStatus.OK);

    const { body: updatedBody } = await request(app.getHttpServer())
      .put(`${basePath}/me`)
      .send({
        ...payload,
        id: createdBody.data.id,
      })
      .set('auth_token', accessToken)
      .expect(HttpStatus.OK);

    expect(updatedBody.data.updatedAt).not.toEqual(createdBody.data.updatedAt);
  });

  it('As a user, I should be able to assign default address to my another billing address', async () => {
    const { accessToken } = await createSession(app);
    const { district, subdistrict, province } = await createAddress(app);
    const payload = {
      billingAddress: 'billingAddress',
      districtId: district.id,
      subdistrictId: subdistrict.id,
      provinceId: province.id,
      country: 'country',
    };
    const { body: createdBody1 } = await request(app.getHttpServer())
      .put(`${basePath}/me`)
      .send(payload)
      .set('auth_token', accessToken)
      .expect(HttpStatus.OK);
    const { body: createdBody2 } = await request(app.getHttpServer())
      .put(`${basePath}/me`)
      .send(payload)
      .set('auth_token', accessToken)
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .put(`${basePath}/me`)
      .send({
        ...payload,
        id: createdBody2.data.id,
        isDefault: true,
      })
      .set('auth_token', accessToken)
      .expect(HttpStatus.OK);

    const [oldDefaultAddress, newDefaultAddress] = await Promise.all([
      app
        .get(EntityManager)
        .getRepository(BillingAddress)
        .findOneOrFail({ id: createdBody1.data.id }),
      app
        .get(EntityManager)
        .getRepository(BillingAddress)
        .findOneOrFail({ id: createdBody2.data.id }),
    ]);
    expect(oldDefaultAddress.isDefault).toBe(false);
    expect(newDefaultAddress.isDefault).toBe(true);
  });

  it('As a user, I should be able to create new billing address', async () => {
    const { accessToken } = await createSession(app);
    const { district, subdistrict, province } = await createAddress(app);
    const payload = {
      id: undefined,
      billingAddress: 'billingAddress',
      districtId: district.id,
      subdistrictId: subdistrict.id,
      provinceId: province.id,
      country: 'country',
    };
    const { body: responseBody1 } = await request(app.getHttpServer())
      .put(`${basePath}/me`)
      .send(payload)
      .set('auth_token', accessToken)
      .expect(HttpStatus.OK);
    await app
      .get(EntityManager)
      .getRepository(BillingAddress)
      .findOneOrFail({ id: responseBody1.data.id });

    const { body: responseBody2 } = await request(app.getHttpServer())
      .put(`${basePath}/me`)
      .send({ ...payload, isDefault: true })
      .set('auth_token', accessToken)
      .expect(HttpStatus.OK);
    await app
      .get(EntityManager)
      .getRepository(BillingAddress)
      .findOneOrFail({ id: responseBody2.data.id });

    const [oldDefaultAddress, newDefaultAddress] = await Promise.all([
      app
        .get(EntityManager)
        .getRepository(BillingAddress)
        .findOneOrFail({ id: responseBody1.data.id }),
      app
        .get(EntityManager)
        .getRepository(BillingAddress)
        .findOneOrFail({ id: responseBody2.data.id }),
    ]);
    expect(oldDefaultAddress.isDefault).toBe(false);
    expect(newDefaultAddress.isDefault).toBe(true);
  });

  it('As a user, I should be able to delete my billing address', async () => {
    const { accessToken } = await createSession(app);
    const { district, subdistrict, province } = await createAddress(app);
    const payloadCreate = {
      billingAddress: 'billingAddress',
      districtId: district.id,
      subdistrictId: subdistrict.id,
      provinceId: province.id,
      country: 'country',
    };
    await request(app.getHttpServer())
      .put(`${basePath}/me`)
      .send(payloadCreate)
      .set('auth_token', accessToken)
      .expect(HttpStatus.OK);
    const { body: responseBody2 } = await request(app.getHttpServer())
      .put(`${basePath}/me`)
      .send(payloadCreate)
      .set('auth_token', accessToken)
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .delete(`${basePath}/me`)
      .send({ id: responseBody2.data.id })
      .set('auth_token', accessToken)
      .expect(HttpStatus.OK);
  });
});
