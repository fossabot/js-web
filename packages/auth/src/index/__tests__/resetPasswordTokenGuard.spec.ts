import { addHours } from 'date-fns';
import { Test, TestingModule } from '@nestjs/testing';
import td from 'testdouble';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Connection } from 'typeorm';
import { AppModule } from '../../app.module';
import ResetPasswordTokenGuard from '../resetPasswordToken.guard';
import { fakeRequestResponse } from '../../utils/testHelpers/execution-context';

function setupForgotPasswordUser() {
  const user = new User();
  user.firstName = 'john';
  user.lastName = 'doe';
  user.email = 'john.doe@mail.com';
  user.passwordResetRequestDateUTC = new Date(new Date().toUTCString());
  user.passwordResetKey = 'passwordResetKey';

  return user.save();
}

describe('ResetPasswordTokenGuard', () => {
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const dbConnection = app.get(Connection);
    await dbConnection.synchronize(true);
  });

  afterEach(async () => {
    td.reset();
  });

  afterAll(async () => {
    await app.get(Connection).close();
    await app.close();
  });

  describe('#canActivate', () => {
    it('return false if request.body.token is undefined', async () => {
      const executionContext = fakeRequestResponse({
        body: {
          token: undefined,
        },
      });
      const isGranted = await app
        .get(ResetPasswordTokenGuard)
        .canActivate(executionContext);

      expect(isGranted).toBe(false);
    });

    it('return false if cannot UsersService.getUserByPassowrdResetKey', async () => {
      const executionContext = fakeRequestResponse({
        body: {
          token: 'NON_TOKEN',
        },
      });
      const isGranted = await app
        .get(ResetPasswordTokenGuard)
        .canActivate(executionContext);

      expect(isGranted).toBe(false);
    });

    it('return false if token is expired', async () => {
      const user = await setupForgotPasswordUser();
      user.passwordResetRequestDateUTC = addHours(new Date(), -99999);
      await user.save();
      const executionContext = fakeRequestResponse({
        body: {
          token: user.passwordResetKey,
        },
      });

      const isGranted = await app
        .get(ResetPasswordTokenGuard)
        .canActivate(executionContext);

      expect(isGranted).toBe(false);
    });

    it('return true if token is valid and not expired', async () => {
      const user = await setupForgotPasswordUser();
      const MAX_VALID_HOURS = 2;
      user.passwordResetRequestDateUTC = addHours(new Date(), -MAX_VALID_HOURS);
      await user.save();
      const executionContext = fakeRequestResponse({
        body: {
          token: user.passwordResetKey,
        },
      });

      const isGranted = await app
        .get(ResetPasswordTokenGuard)
        .canActivate(executionContext);

      expect(isGranted).toBe(true);
    });
  });
});
