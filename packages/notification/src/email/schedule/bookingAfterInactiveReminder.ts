import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailNotification } from '@seaccentral/core/dist/notification/EmailNotification.entity';
import { EmailNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/EmailNotificationSubCategory.enum';
import { NotificationVariableDict } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { UserAuthProvider } from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import { BANGKOK_TIMEZONE } from '@seaccentral/core/dist/utils/constants';
import { addSeconds, differenceInDays, isAfter } from 'date-fns';
import { Repository } from 'typeorm';
import { BaseReminder } from './baseReminder';

@Injectable()
export class BookingAfterInactiveReminder extends BaseReminder {
  constructor(
    @InjectRepository(EmailNotification)
    emailNotificationRepository: Repository<EmailNotification>,
    @InjectRepository(UserAuthProvider)
    private readonly userAuthProviderRepository: Repository<UserAuthProvider>,
    notificationProducer: NotificationProducer,
    private readonly configService: ConfigService,
  ) {
    super(emailNotificationRepository, notificationProducer);
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM, {
    timeZone: BANGKOK_TIMEZONE,
  })
  async execute() {
    const emailNotif = await super.getEmailNotification(
      EmailNotificationSubCategoryKey.REMINDER_BOOKING_AFTER_INACTIVE,
    );

    if (!emailNotif) return;

    const now = new Date();

    const authProviders = await this.userAuthProviderRepository
      .createQueryBuilder('uap')
      .leftJoinAndSelect('uap.passwordRecords', 'passwordRecords')
      .leftJoinAndSelect('uap.user', 'user')
      .where('user.isActivated = :isActivated', { isActivated: true })
      .getMany();

    const recipients: User[] = [];

    authProviders.forEach((authProvider) => {
      let latestActiveDate: Date | null = null;

      if (authProvider.passwordRecords) {
        authProvider.passwordRecords.forEach((pwr) => {
          if (latestActiveDate === null || latestActiveDate < pwr.createdAt)
            latestActiveDate = pwr.createdAt;
        });
      }

      if (
        authProvider.user.lastLoginDate !== null &&
        (latestActiveDate === null ||
          latestActiveDate < authProvider.user.lastLoginDate)
      )
        latestActiveDate = authProvider.user.lastLoginDate;

      emailNotif.triggerType.triggerSeconds.forEach((seconds) => {
        if (latestActiveDate) {
          const sendDate = addSeconds(latestActiveDate, seconds);
          if (isAfter(now, sendDate) && differenceInDays(now, sendDate) === 0) {
            recipients.push(authProvider.user);
          }
        }
      });
    });

    recipients.forEach((user) => {
      if (user.email) {
        super.enqueueEmail({
          key: EmailNotificationSubCategoryKey.REMINDER_BOOKING_AFTER_INACTIVE,
          language: user.emailNotificationLanguage,
          to: user.email,
          replacements: {
            [NotificationVariableDict.FULL_NAME.alias]: user.fullName,
            [NotificationVariableDict.DASHBOARD_COURSES_LINK
              .alias]: `${this.configService.get('WEB_URL')}/dashboard/courses`,
            [NotificationVariableDict.LOGIN_LINK
              .alias]: `${this.configService.get('WEB_URL')}/login`,
          },
        });
      }
    });
  }
}
