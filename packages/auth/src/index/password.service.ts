import {
  HttpException,
  HttpStatus,
  Injectable,
  PreconditionFailedException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { compare, hash } from '@seaccentral/core/dist/utils/crypt';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { PasswordRecord } from '@seaccentral/core/dist/user/PasswordRecord.entity';
import { UserAuthProvider } from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import { PasswordSetting } from '@seaccentral/core/dist/admin/Password.setting.entity';

@Injectable()
export class PasswordService extends TransactionFor<PasswordService> {
  constructor(
    @InjectRepository(PasswordSetting)
    private passwordSettingRepository: Repository<PasswordSetting>,
    @InjectRepository(PasswordRecord)
    private readonly passwordRecordRepository: Repository<PasswordRecord>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  static savePasswordResetToken(user: User, passwordResetToken: string) {
    user.passwordResetKey = passwordResetToken;
    user.passwordResetRequestDateUTC = new Date(new Date().toUTCString());

    return user.save();
  }

  static generatePasswordResetToken() {
    return uuidv4();
  }

  static getPasswordHash(password: string) {
    return hash(password);
  }

  static isPasswordMatch(plainTextPassword: string, hashedPassword: string) {
    return compare(plainTextPassword, hashedPassword);
  }

  async changePassword(
    userAuthProvider: UserAuthProvider,
    newPassword: string,
  ) {
    const passwordRecords = userAuthProvider.passwordRecords || [];
    const isAlreadyUsed = await PasswordService.isPasswordAlreadyUsed(
      passwordRecords,
      newPassword,
    );
    if (isAlreadyUsed) {
      throw new PreconditionFailedException('This password is already used');
    }

    userAuthProvider.hashedPassword = await PasswordService.getPasswordHash(
      newPassword,
    );
    const passwordRecord = await this.createPasswordRecord(
      userAuthProvider,
      newPassword,
    );
    const setting = await this.passwordSettingRepository.findOne();
    if (!setting) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Password setting not found!',
          code: '404',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const date = new Date();
    date.setDate(date.getDate() + setting.expireIn);
    userAuthProvider.passwordExpireDate = new Date(date.toUTCString());
    userAuthProvider.passwordExpiryNotificationSentAt = null;
    await Promise.all([
      userAuthProvider.save(),
      this.savePasswordRecord(passwordRecords, passwordRecord),
    ]);

    return userAuthProvider;
  }

  static async isPasswordAlreadyUsed(
    userPasswordRecords: PasswordRecord[],
    password: string,
  ) {
    const resolveMatches = await Promise.all(
      userPasswordRecords.map((entry) =>
        PasswordService.isPasswordMatch(password, entry.hashedPassword),
      ),
    );

    return resolveMatches.includes(true);
  }

  async record(userAuthProvider: UserAuthProvider, newPassword: string) {
    const passwordRecord = await this.createPasswordRecord(
      userAuthProvider,
      newPassword,
    );

    return this.savePasswordRecord(
      userAuthProvider.passwordRecords || [],
      passwordRecord,
    );
  }

  async createPasswordRecord(
    userAuthProvider: UserAuthProvider,
    newPassword: string,
  ) {
    if (userAuthProvider.provider !== 'password') {
      throw new PreconditionFailedException(
        `provider must be password, got ${userAuthProvider.provider}`,
      );
    }

    const oldPassword = this.passwordRecordRepository.create();
    oldPassword.hashedPassword = await PasswordService.getPasswordHash(
      newPassword,
    );
    oldPassword.userAuthProvider = userAuthProvider;

    return oldPassword;
  }

  async savePasswordRecord(
    userPasswordRecords: PasswordRecord[],
    newPasswordRecord: PasswordRecord,
  ) {
    const MAX_ENTRIES_ALLOWED = 3;
    if (userPasswordRecords.length >= MAX_ENTRIES_ALLOWED) {
      await this.removeOldestPasswordRecord(newPasswordRecord.userAuthProvider);
    }
    const saved = await this.passwordRecordRepository.save(newPasswordRecord);

    return saved;
  }

  private async removeOldestPasswordRecord(userAuthProvider: UserAuthProvider) {
    const entity = await this.passwordRecordRepository.find({
      where: {
        userAuthProvider,
      },
      order: { createdAt: 'ASC' },
      take: 1,
    });

    return this.passwordRecordRepository.remove(entity);
  }
}
