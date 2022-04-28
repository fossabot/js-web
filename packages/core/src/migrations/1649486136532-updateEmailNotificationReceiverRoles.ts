import { MigrationInterface, QueryRunner } from 'typeorm';
import { EmailNotificationSubCategoryKey } from '../notification/enum/EmailNotificationSubCategory.enum';
import { NotificationReceiverRole } from '../notification/enum/NotificationReceiverRole.enum';

export class updateEmailNotificationReceiverRoles1649486136532
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` WITH sub_category AS (
	        SELECT id FROM email_notification_sub_category WHERE email_notification_sub_category.key = $1
       )
        UPDATE email_notification SET "receiverRoles" = $2 WHERE email_notification."categoryId" = (SELECT id FROM sub_category)`,
      [
        EmailNotificationSubCategoryKey.BOOKING_SCHEDULE_CHANGED,
        `{${[
          NotificationReceiverRole.LEARNER,
          NotificationReceiverRole.INSTRUCTOR,
          NotificationReceiverRole.MODERATOR,
        ].join(',')}}`,
      ],
    );

    await queryRunner.query(
      ` WITH sub_category AS (
	        SELECT id FROM email_notification_sub_category WHERE email_notification_sub_category.key = $1
       )
        UPDATE email_notification SET "receiverRoles" = $2 WHERE email_notification."categoryId" = (SELECT id FROM sub_category)`,
      [
        EmailNotificationSubCategoryKey.BOOKING_INSTRUCTOR_CHANGED,
        `{${[
          NotificationReceiverRole.INSTRUCTOR,
          NotificationReceiverRole.MODERATOR,
        ].join(',')}}`,
      ],
    );

    await queryRunner.query(
      ` WITH sub_category AS (
	        SELECT id FROM email_notification_sub_category WHERE email_notification_sub_category.key = $1
       )
        UPDATE email_notification SET "receiverRoles" = $2 WHERE email_notification."categoryId" = (SELECT id FROM sub_category)`,
      [
        EmailNotificationSubCategoryKey.BOOKING_CANCELLATION_BY_ADMIN,
        `{${[
          NotificationReceiverRole.LEARNER,
          NotificationReceiverRole.INSTRUCTOR,
          NotificationReceiverRole.MODERATOR,
        ].join(',')}}`,
      ],
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
