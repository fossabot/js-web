import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import request from 'supertest';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { User } from '@seaccentral/core/dist/user/User.entity';
import {
  setupApp,
  teardownApp,
} from '../src/utils/testHelpers/setup-integration';
import { getRandomEmail } from '../src/utils/testHelpers/email-util';

jest.mock('@seaccentral/core/dist/external-package-provider/instancy.service');

async function setupForPasswordRegisterUser(nestApp: INestApplication) {
  const email = getRandomEmail('yopmail.com');
  await request(nestApp.getHttpServer())
    .post('/v1/signup/local')
    .send({
      firstName: 'John',
      lastName: 'Doe',
      email,
      password: '#2EiwH3y',
    })
    .expect(HttpStatus.CREATED);
  const usersService = nestApp.get(UsersService);
  const user = await usersService.getByEmail(email);
  expect(user).toBeDefined();

  return {
    user: user as User,
  };
}

describe('PasswordController (e2e)', () => {
  let app: TestingModule;
  let nestApp: INestApplication;

  beforeEach(async () => {
    app = await setupApp();
    nestApp = app.createNestApplication();
    await nestApp.init();
  });

  afterAll(async () => {
    await teardownApp(app);
  });

  // to be fixed
  it.skip('As a password registered user, I can login using my new password after I reset my old password', async () => {
    const { user } = await setupForPasswordRegisterUser(nestApp);
    const myNewPassword = 'newP&ssw0rd';

    await request(nestApp.getHttpServer())
      .post('/v1/forgot-password')
      .send({ email: user.email })
      .expect(HttpStatus.NO_CONTENT);

    // because nothing is returned from /forgot-password, we have to get password reset key from db directly
    // assumes that user receives email that contains link to reset password
    const { passwordResetKey } = await nestApp
      .get(EntityManager)
      .getRepository(User)
      .findOneOrFail(user.id);
    expect(typeof passwordResetKey).toBe('string');

    await request(nestApp.getHttpServer())
      .post('/v1/validate-password-token')
      .send({ token: passwordResetKey })
      .expect(HttpStatus.OK);

    await request(nestApp.getHttpServer())
      .post('/v1/reset-password')
      .send({ token: passwordResetKey, password: myNewPassword })
      .expect(HttpStatus.OK);

    // Wait for testing server to have some entropy so that it creates a different jwt signature.
    // Then, it can save in user session db table that has uniqueness check.
    const { body } = await new Promise((resolve) =>
      setTimeout(async () => {
        const res = await request(nestApp.getHttpServer())
          .post('/v1/login')
          .send({
            email: user.email,
            password: myNewPassword,
          })
          .expect(HttpStatus.OK);
        resolve(res);
      }, 1000),
    );
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
  });
});
