import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BANGKOK_TIMEZONE } from '@seaccentral/core/dist/utils/constants';
import { PushNotification } from '@seaccentral/core/dist/notification/PushNotification.entity';
import { NotificationVariableDict as NV } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { UserAssignedLearningTrack } from '@seaccentral/core/dist/learning-track/UserAssignedLearningTrack.entity';
import { BaseNotificationReminder } from './base.reminder';

@Injectable()
export class AssignedLearningTrackReminder extends BaseNotificationReminder {
  constructor(
    private readonly notificationProducer: NotificationProducer,
    @InjectRepository(UserAssignedLearningTrack)
    private readonly userAssignedLearningTrack: Repository<UserAssignedLearningTrack>,
    @InjectRepository(PushNotification)
    private readonly pushNotification: Repository<PushNotification>,
  ) {
    super(pushNotification);
  }

  @Cron(CronExpression.EVERY_DAY_AT_7AM, { timeZone: BANGKOK_TIMEZONE })
  async execute() {
    const { notification, triggerSeconds } = await super.getPushNotification(
      PushNotificationSubCategoryKey.REMINDER_COMPLETE_REQUIRED_LEARNING_TRACK,
    );

    if (!notification || !triggerSeconds) return;

    const now = new Date();

    const userAssignedLearningTracks = await this.userAssignedLearningTrack
      .createQueryBuilder('ual')
      .innerJoinAndSelect(
        'ual.learningTrack',
        'learningTrack',
        'learningTrack.isActive = :isActive',
      )
      .innerJoinAndSelect('learningTrack.title', 'title')
      .innerJoin('ual.user', 'user', 'user.isActivated = :isActivated')
      .where('ual.dueDateTime IS NOT NULL AND ual.dueDateTime > :now')
      .setParameters({
        now,
        isActivated: true,
        isActive: true,
      })
      .getMany();

    const notifications: { ual: UserAssignedLearningTrack; userId: string }[] =
      [];

    super.generateNotificationsItems(
      userAssignedLearningTracks,
      triggerSeconds,
      now,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (ual) => ual.dueDateTime!,
      (ual) => notifications.push({ ual, userId: ual.userId }),
    );

    await Promise.all(
      notifications.map((n) =>
        this.notificationProducer.notify(
          PushNotificationSubCategoryKey.REMINDER_COMPLETE_REQUIRED_LEARNING_TRACK,
          n.userId,
          {
            [NV.COURSE_NAME.alias]: n.ual.learningTrack.title,
            [NV.MEMBERSHIP_REMAINING_DAYS.alias]:
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              n.ual.dueDateTime!.getDate() - now.getDate(),
          },
        ),
      ),
    );
  }
}
