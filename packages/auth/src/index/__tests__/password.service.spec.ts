/**
 * Import core package from dist because original modules import from dist, so that they can be stub for integration test.
 * Build core package first before running the test
 */

import { PreconditionFailedException } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { addDays } from 'date-fns';
import { PasswordRecord } from '@seaccentral/core/dist/user/PasswordRecord.entity';
import {
  ExternalAuthProviderType,
  UserAuthProvider,
} from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { EntityManager } from 'typeorm';
import { PasswordService } from '../password.service';
import {
  setupApp,
  teardownApp,
} from '../../utils/testHelpers/setup-integration';

async function setupUser() {
  const user = new User();
  user.firstName = 'john';
  user.lastName = 'doe';
  user.email = 'john.doe@mail.com';

  const userAuthProvider = new UserAuthProvider();
  userAuthProvider.user = user;
  userAuthProvider.provider = 'password';

  return {
    user: await user.save(),
    userAuth: await userAuthProvider.save(),
  };
}

describe('PasswordService, TypeORM, Postgres', () => {
  let app: TestingModule;

  beforeEach(async () => {
    app = await setupApp();
  });

  afterAll(async () => {
    await teardownApp(app);
  });

  describe('#chagePassword', () => {
    it('set new password to UserAuthProvider', async () => {
      const { userAuth } = await setupUser();
      const newPassword = 'newPassword';

      await app.get(PasswordService).changePassword(userAuth, newPassword);

      const result = await app
        .get(EntityManager)
        .getRepository(UserAuthProvider)
        .findOneOrFail();

      expect(result).toBeDefined();
      expect(
        await PasswordService.isPasswordMatch(
          newPassword,
          result.hashedPassword as string,
        ),
      ).toBe(true);
    });

    it('throw exception if new password exist in password record', async () => {
      const { userAuth } = await setupUser();
      const currentPassword = 'currentPassword';
      const record1 = new PasswordRecord();
      record1.hashedPassword = await PasswordService.getPasswordHash(
        currentPassword,
      );
      record1.userAuthProvider = userAuth;
      await record1.save();

      const userAuthProvider = await app
        .get(EntityManager)
        .getRepository(UserAuthProvider)
        .findOneOrFail({
          relations: ['passwordRecords'],
        });

      return expect(
        app
          .get(PasswordService)
          .changePassword(userAuthProvider, currentPassword),
      ).rejects.toThrow();
    });
  });

  describe('#isPasswordAlreadyUsed', () => {
    it('return true if password found in UserAuthProvider.passwordRecords', async () => {
      const newPassword = 'hashedPassword1';
      const record1 = new PasswordRecord();
      const record2 = new PasswordRecord();
      const record3 = new PasswordRecord();

      record1.hashedPassword = await PasswordService.getPasswordHash(
        'hashedPassword1',
      );
      record1.createdAt = addDays(new Date(), -1);
      record2.hashedPassword = await PasswordService.getPasswordHash(
        'hashedPassword2',
      );
      record2.createdAt = addDays(new Date(), -2);
      record3.hashedPassword = await PasswordService.getPasswordHash(
        'hashedPassword3',
      );
      record3.createdAt = addDays(new Date(), -3);
      const passwordRecordRepository = app
        .get(EntityManager)
        .getRepository(PasswordRecord);
      await passwordRecordRepository.save([record1, record2, record3]);

      const passwordRecords = await passwordRecordRepository.find();
      const hasAlreadyUsed = await PasswordService.isPasswordAlreadyUsed(
        passwordRecords,
        newPassword,
      );

      expect(hasAlreadyUsed).toBe(true);
    });
  });

  describe('#createPasswordRecord', () => {
    it('throw exception if provider !== password', () => {
      const userAuthProvider = new UserAuthProvider();
      userAuthProvider.provider = ExternalAuthProviderType.Facebook;

      return expect(() =>
        app.get(PasswordService).createPasswordRecord(userAuthProvider, ''),
      ).rejects.toThrow(PreconditionFailedException);
    });

    it('should create expected PasswordRecord entity', async () => {
      const newPassword = 'newPassword';
      const userAuthProvider = new UserAuthProvider();
      userAuthProvider.provider = 'password';

      const result = await app
        .get(PasswordService)
        .createPasswordRecord(userAuthProvider, newPassword);
      expect(
        await PasswordService.isPasswordMatch(
          newPassword,
          result.hashedPassword,
        ),
      ).toBe(true);
      expect(result.userAuthProvider).toEqual(userAuthProvider);
    });
  });

  describe('#savePasswordRecord', () => {
    it('should save newPasswordRecord', async () => {
      const newRecord = new PasswordRecord();
      newRecord.hashedPassword = 'newHashedPassword';

      await app.get(PasswordService).savePasswordRecord([], newRecord);

      const recordInDb = await app
        .get(EntityManager)
        .getRepository(PasswordRecord)
        .find();
      expect(recordInDb.length).toBe(1);
      expect(recordInDb[0].hashedPassword).toEqual(newRecord.hashedPassword);
    });

    it('should remove oldest PasswordRecord.created_at if userPasswordRecords.length >= 3', async () => {
      const { userAuth } = await setupUser();
      const passwordRecord1 = new PasswordRecord();
      const passwordRecord2 = new PasswordRecord();
      const passwordRecord3 = new PasswordRecord();
      passwordRecord1.hashedPassword = 'oldestPassword';
      passwordRecord1.createdAt = addDays(new Date(), -3);
      passwordRecord1.userAuthProvider = userAuth;
      passwordRecord2.hashedPassword = 'hashedPassword2';
      passwordRecord2.userAuthProvider = userAuth;
      passwordRecord3.hashedPassword = 'hashedPassword3';
      passwordRecord3.userAuthProvider = userAuth;
      const passwordRecordRepository = app
        .get(EntityManager)
        .getRepository(PasswordRecord);
      await passwordRecordRepository.save([
        passwordRecord1,
        passwordRecord2,
        passwordRecord3,
      ]);

      const newRecord = new PasswordRecord();
      newRecord.hashedPassword = 'newHashedPassword';
      newRecord.userAuthProvider = userAuth;
      const records = await passwordRecordRepository.find();
      await app.get(PasswordService).savePasswordRecord(records, newRecord);

      const recordInDb = await passwordRecordRepository.find();
      expect(recordInDb.length).toBe(3);
      expect(
        recordInDb.find((record) => record.hashedPassword === 'oldestPassword'),
      ).not.toBeDefined();
    });
  });
});
