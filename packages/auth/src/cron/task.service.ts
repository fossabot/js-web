import { Repository, LessThanOrEqual } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { UserSession } from '@seaccentral/core/dist/user/UserSession.entity';
import { PasswordSetting } from '@seaccentral/core/dist/admin/Password.setting.entity';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(PasswordSetting)
    private passwordSettingRepository: Repository<PasswordSetting>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async unlockUsersTask() {
    try {
      const targetDate = new Date().toUTCString();
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          isLockedOut: false,
          lockoutEndDateUTC: null,
          accessFailedCount: 0,
        })
        .where({
          isLockedOut: true,
          lockoutEndDateUTC: LessThanOrEqual(targetDate),
        })
        .execute();
    } catch (error) {
      this.logger.error('Error unlocking user', error);
    }
  }

  // @Cron(CronExpression.EVERY_HOUR)
  // async killedPasswordExpiredUserSessionTask() {
  //   try {
  //     const users = await this.getPasswordExpiredUsers();
  //     if (users.length <= 0) {
  //       return;
  //     }
  //     await this.userSessionRepository
  //       .createQueryBuilder('user_session')
  //       .delete()
  //       .from(UserSession)
  //       .where('userId IN (:...userIds)', {
  //         userIds: users.map((user: User) => user.id),
  //       })
  //       .execute();
  //   } catch (error) {
  //     this.logger.error('Error removing session for expired password', error);
  //   }
  // }

  async getPasswordExpiredUsers() {
    const passwordSetting = await this.passwordSettingRepository.findOne();
    if (!passwordSetting) {
      throw new HttpException(
        'Password setting has no value.',
        HttpStatus.NOT_FOUND,
      );
    }
    const date = new Date(new Date().toUTCString());
    const data = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user_auth_provider', 'uap', 'uap.userId = user.id')
      .where('uap.passwordExpireDate <= :date', { date })
      .andWhere("uap.provider = 'password'")
      .orderBy('uap.updatedAt', 'ASC')
      .getMany();
    return data;
  }
}
