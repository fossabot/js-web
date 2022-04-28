import { differenceInDays, addDays } from 'date-fns';
import { Repository } from 'typeorm/repository/Repository';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/EmailNotificationSubCategory.enum';
import { BANGKOK_TIMEZONE } from '@seaccentral/core/dist/utils/constants';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { EmailNotification } from '@seaccentral/core/dist/notification/EmailNotification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationVariableDict } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { Invitation } from '@seaccentral/core/dist/invitation/Invitation.entity';
import { ConfigService } from '@nestjs/config';
import { IsNull, LessThan, MoreThanOrEqual } from 'typeorm';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';

import { BaseReminder } from './baseReminder';

@Injectable()
export class ActivateAccountReminder extends BaseReminder {
  constructor(
    @InjectRepository(EmailNotification)
    emailNotificationRepository: Repository<EmailNotification>,
    notificationProducer: NotificationProducer,
    private readonly configService: ConfigService,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
  ) {
    super(emailNotificationRepository, notificationProducer);
  }

  @Cron(CronExpression.EVERY_DAY_AT_7AM, {
    timeZone: BANGKOK_TIMEZONE,
  })
  async execute(): Promise<void> {
    const emailNotif = await super.getEmailNotification(
      EmailNotificationSubCategoryKey.REMINDER_ACTIVATE_ACCOUNT,
    );

    if (!emailNotif) return;

    const now = new Date();

    const reminderDays = super.getReminderDays(
      now,
      emailNotif.triggerType.triggerSeconds,
    );

    // If we want users who have been invited for X days.
    // We would query for X + 1 day as we also want to get invitation in between X to X + 1
    const start = addDays(now, -(Math.abs(reminderDays[0]) + 1));

    const staledInvitation = await this.invitationRepository.find({
      where: {
        createdAt: LessThan(now) && MoreThanOrEqual(start),
        userId: IsNull(),
      },
    });

    if (staledInvitation.length < 1) return;

    const recipients: Invitation[] = [];
    staledInvitation.forEach((invitation) => {
      const diff = differenceInDays(now, invitation.createdAt);
      if (!reminderDays.includes(diff)) return;

      recipients.push(invitation);
    });

    recipients.forEach((invitation) => {
      if (invitation.email) {
        super.enqueueEmail({
          key: EmailNotificationSubCategoryKey.REMINDER_ACTIVATE_ACCOUNT,
          language: LanguageCode.EN,
          to: invitation.email,
          replacements: {
            [NotificationVariableDict.FULL_NAME
              .alias]: `${invitation.firstName} ${invitation.lastName}`,
            [NotificationVariableDict.EMAIL.alias]: invitation.email,
            [NotificationVariableDict.ACCOUNT_ACTIVATION_LINK
              .alias]: `${this.configService.get(
              'WEB_URL',
            )}/setup-account?token=${invitation.token}`,
          },
        });
      }
    });
  }
}
