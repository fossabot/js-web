import { HttpStatus, INestApplication } from '@nestjs/common';
import { SeedService } from '@seaccentral/core/dist/seed/seed.service';
import request from 'supertest';
import { ConfigService } from '@nestjs/config';
import {
  beforeEachServer,
  clearDbModels,
  setupServer,
  teardownServer,
} from '../src/utils/testHelpers/setup-e2e';

describe('Sync E2E', () => {
  const baseSyncPath = '/v1/sync';
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupServer();
  });

  beforeEach(async () => {
    await beforeEachServer(app);
    await app.get(SeedService).createMockedPlans();
  });

  afterAll(async () => {
    await clearDbModels(app);
    await teardownServer(app);
  });

  describe('SubscriptionPlan', () => {
    it('Return 401 if requested without token', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        `${baseSyncPath}/subscription-plans`,
      );
      expect(status).toEqual(401);
      expect(body).toEqual({ statusCode: 401, message: 'Token Mismatched' });
    });

    it('Return 401 if requested with incorrect token', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`${baseSyncPath}/subscription-plans`)
        .set('X-Sync-Token', 'PIZZAHUT');
      expect(status).toEqual(HttpStatus.UNAUTHORIZED);
      expect(body).toEqual({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Token Mismatched',
      });
    });

    it('Return 200 if requested with correct token', async () => {
      const token = await app.get(ConfigService).get('X_SYNC_TOKEN');

      const { status, body } = await request(app.getHttpServer())
        .get(`${baseSyncPath}/subscription-plans`)
        .set('X-Sync-Token', token);

      expect(status).toEqual(HttpStatus.OK);
      expect(body).toBeInstanceOf(Array);
    });
  });

  describe('RawProduct', () => {
    it('Return 401 if requested without token', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        `${baseSyncPath}/raw-products`,
      );
      expect(status).toEqual(401);
      expect(body).toEqual({ statusCode: 401, message: 'Token Mismatched' });
    });

    it('Return 401 if requested with incorrect token', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`${baseSyncPath}/raw-products`)
        .set('X-Sync-Token', 'PIZZAHUT');
      expect(status).toEqual(HttpStatus.UNAUTHORIZED);
      expect(body).toEqual({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Token Mismatched',
      });
    });

    it('Return 200 if requested with correct token', async () => {
      const token = await app.get(ConfigService).get('X_SYNC_TOKEN');

      const { status, body } = await request(app.getHttpServer())
        .get(`${baseSyncPath}/raw-products`)
        .set('X-Sync-Token', token);

      expect(status).toEqual(HttpStatus.OK);
      expect(Object.keys(body)).toEqual(expect.arrayContaining(['data']));
    });
  });
});
