import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getUnixTime, addDays } from 'date-fns';
import { setupServer, teardownServer } from '../src/lib/testHelpers/setup-e2e';
import { createSession } from '../src/lib/testHelpers/fixtures';

describe('DashboardController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await setupServer();
  });

  afterEach(async () => {
    await teardownServer(app);
  });

  it('as an admin, I should be able to filter by date range for payment data', async () => {
    const { accessToken } = await createSession(app);
    const now = new Date();
    const query = {
      fromDate: getUnixTime(addDays(now, -7)),
      toDate: getUnixTime(addDays(now, 7)),
    };
    const { body } = await request(app.getHttpServer())
      .get('/v1/dashboard/payment')
      .set('auth_token', accessToken)
      .query(query)
      .expect(HttpStatus.OK);

    const { data } = body;
    expect(data.newUser).toBeGreaterThanOrEqual(0);
    expect(data.renewUser).toBeGreaterThanOrEqual(0);
    expect(data.expiredUser).toBeGreaterThanOrEqual(0);
    expect(data.unsuccessfulPayment).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(data.packageType)).toBe(true);
    expect(Array.isArray(data.memberType)).toBe(true);
    expect(data.revenue).toBeGreaterThanOrEqual(0);
  });

  it('as an admin, I should be able to export a csv file from payment data', async () => {
    const { accessToken } = await createSession(app);
    const now = new Date();
    const query = {
      fromDate: getUnixTime(addDays(now, -7)),
      toDate: getUnixTime(addDays(now, 7)),
    };

    const response = await request(app.getHttpServer())
      .get('/v1/dashboard/payment/csv')
      .query(query)
      .set('auth_token', accessToken)
      .expect(HttpStatus.OK)
      .buffer()
      .parse((responseStream, callback) => {
        const chunks: Buffer[] = [];
        responseStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        responseStream.on('error', (err) => callback(err, null));
        responseStream.on('end', () =>
          callback(null, Buffer.concat(chunks).toString('utf8')),
        );
      });
    expect(response.headers['content-disposition']).toContain('.csv');
    expect(response.headers['content-type']).toContain('csv');
    expect(response.body).toMatchSnapshot();
  });
});
