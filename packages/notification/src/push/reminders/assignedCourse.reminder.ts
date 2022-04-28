import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BANGKOK_TIMEZONE } from '@seaccentral/core/dist/utils/constants';
import { PushNotification } from '@seaccentral/core/dist/notification/PushNotification.entity';
import { NotificationVariableDict as NV } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { UserAssignedCourse } from '@seaccentral/core/dist/course/UserAssignedCourse.entity';
import { BaseNotificationReminder } from './base.reminder';

@Injectable()
export class AssignedCourseReminder extends BaseNotificationReminder {
  constructor(
    private readonly notificationProducer: NotificationProducer,
    @InjectRepository(UserAssignedCourse)
    private readonly userAssignedCourse: Repository<UserAssignedCourse>,
    @InjectRepository(PushNotification)
    private readonly pushNotification: Repository<PushNotification>,
  ) {
    super(pushNotification);
  }

  @Cron(CronExpression.EVERY_DAY_AT_7AM, { timeZone: BANGKOK_TIMEZONE })
  async execute() {
    const { notification, triggerSeconds } = await super.getPushNotification(
      PushNotificationSubCategoryKey.REMINDER_COMPLETE_REQUIRED_COURSE,
    );

    if (!notification || !triggerSeconds) return;

    const now = new Date();

    const userAssignedCourses = await this.userAssignedCourse
      .createQueryBuilder('uac')
      .innerJoinAndSelect('uac.course', 'course', 'course.isActive = :isActive')
      .innerJoinAndSelect('course.title', 'title')
      .innerJoin('uac.user', 'user', 'user.isActivated = :isActivated')
      .where('uac.dueDateTime IS NOT NULL AND uac.dueDateTime > :now')
      .setParameters({
        now,
        isActivated: true,
        isActive: true,
      })
      .getMany();

    const notifications: { uac: UserAssignedCourse; userId: string }[] = [];

    super.generateNotificationsItems(
      userAssignedCourses,
      triggerSeconds,
      now,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (uac) => uac.dueDateTime!,
      (uac) => notifications.push({ uac, userId: uac.userId }),
    );

    await Promise.all(
      notifications.map((n) =>
        this.notificationProducer.notify(
          PushNotificationSubCategoryKey.REMINDER_COMPLETE_REQUIRED_COURSE,
          n.userId,
          {
            [NV.COURSE_NAME.alias]: n.uac.course.title,
            [NV.MEMBERSHIP_REMAINING_DAYS.alias]:
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              n.uac.dueDateTime!.getDate() - now.getDate(),
          },
        ),
      ),
    );
  }
}
