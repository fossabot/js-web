import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createNewUser,
  createSession,
  lockUser,
} from '../src/utils/testHelpers/fixtures';
import {
  beforeEachServer,
  setupServer,
  teardownServer,
} from '../src/utils/testHelpers/setup-e2e';

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  const baseAdminPath = '/v1/admin';

  beforeAll(async () => {
    app = await setupServer();
  });

  beforeEach(async () => {
    await beforeEachServer(app);
  });

  afterAll(async () => {
    await teardownServer(app);
  });

  it('should allow authenticated user get login Settings', async () => {
    const { accessToken } = await createSession(app);
    const { status, body } = await request(app.getHttpServer())
      .get(`${baseAdminPath}/setting/login`)
      .set('auth_token', accessToken);
    expect(status).toEqual(200);
    expect(body.data).toHaveProperty('maxAttempts');
    expect(body.data).toHaveProperty('lockDuration');
  });

  it('should allow authenticated user (admin) unlock a locked user', async () => {
    const { accessToken } = await createSession(app);
    const newUser = await createNewUser(app);
    await lockUser(app, newUser.id);
    const { status } = await request(app.getHttpServer())
      .put(`${baseAdminPath}/users/unlock`)
      .send({ ids: [newUser.id] })
      .set('auth_token', accessToken);
    expect(status).toEqual(204);
  });

  it('should not allow authenticated user (admin) unlock a user that is not locked', async () => {
    const { accessToken } = await createSession(app);
    const newUser = await createNewUser(app);
    const { status } = await request(app.getHttpServer())
      .put(`${baseAdminPath}/users/${newUser.id}/unlock`)
      .set('auth_token', accessToken);
    expect(status).toEqual(404);
  });

  it('should not allow authenticated user get login Settings', async () => {
    const { status } = await request(app.getHttpServer()).get(
      `${baseAdminPath}/setting/login`,
    );
    expect(status).toEqual(401);
  });
});
