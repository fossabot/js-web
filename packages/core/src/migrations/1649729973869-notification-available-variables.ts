import { MigrationInterface, QueryRunner } from 'typeorm';
import { EmailNotificationSubCategoryKey } from '../notification/enum/EmailNotificationSubCategory.enum';
import { PushNotificationSubCategoryKey } from '../notification/enum/PushNotificationSubCategory.enum';
import { EmailNotificationSeedData } from '../notification/seed-data/EmailNotificationSeedData';
import { PushNotificationSeedData } from '../notification/seed-data/PushNotificationSeedData';

export class notificationAvailableVariables1649729973869
  implements MigrationInterface
{
  name = 'notificationAvailableVariables1649729973869';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "email_notification" ADD "availableVariables" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification" ADD "availableVariables" jsonb NOT NULL DEFAULT '[]'`,
    );

    // Prepare the initial available variables for push notifications.
    const pushUpdateKeys: PushNotificationSubCategoryKey[] = [
      PushNotificationSubCategoryKey.LEARNING_ACTIVITY_COURSE_ENROLLMENT,
      PushNotificationSubCategoryKey.LEARNING_ACTIVITY_COURSE_COMPLETION,
      PushNotificationSubCategoryKey.LEARNING_ACTIVITY_LEARNING_TRACK_ENROLLMENT,
      PushNotificationSubCategoryKey.LEARNING_ACTIVITY_LEARNING_TRACK_COMPLETION,
      PushNotificationSubCategoryKey.LEARNING_ACTIVITY_SESSION_BOOKED,
      PushNotificationSubCategoryKey.LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_USER,
      PushNotificationSubCategoryKey.LEARNING_ACTIVITY_SESSION_CANCELLED_BY_ADMIN,
      PushNotificationSubCategoryKey.LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_ADMIN,
      PushNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION,
      PushNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE,
      PushNotificationSubCategoryKey.ASSIGNMENT_TO_LEARNING_TRACK,
      PushNotificationSubCategoryKey.MEMBERSHIP_RENEWAL,
      PushNotificationSubCategoryKey.MEMBERSHIP_ACTIVATED,
      PushNotificationSubCategoryKey.MEMBERSHIP_EXPIRING_REMINDER,
      PushNotificationSubCategoryKey.CERTIFICATE_UNLOCKED,
      PushNotificationSubCategoryKey.REMINDER_COMPLETE_REQUIRED_COURSE,
      PushNotificationSubCategoryKey.REMINDER_COMPLETE_REQUIRED_LEARNING_TRACK,
      PushNotificationSubCategoryKey.REMINDER_UPCOMING_BOOKED_EVENTS,
      PushNotificationSubCategoryKey.REMINDER_ASSESSMENT_RESULT_REQUIRED,
      PushNotificationSubCategoryKey.REMINDER_ASSESSMENT_UNLOCKED,
    ];

    const promiseUpdatePushNotifications = pushUpdateKeys
      .filter((key) => !!PushNotificationSeedData[key])
      .map((key) => {
        return queryRunner.query(
          `
        UPDATE "push_notification"
        SET "availableVariables" = $1
        FROM (
          SELECT id FROM "push_notification_sub_category" WHERE "push_notification_sub_category"."key" = $2
        ) AS "category"
        WHERE "push_notification"."categoryId" = "category"."id"`,
          [
            JSON.stringify(PushNotificationSeedData[key].availableVariables),
            key,
          ],
        );
      });
    await Promise.all(promiseUpdatePushNotifications);

    // Prepare the initial available variables for email notifications.
    const emailUpdateKeys = [
      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE,
      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_LEARNING_TRACK,
      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION_F2F,
      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION_VIRTUAL,
      EmailNotificationSubCategoryKey.BOOKING_CANCELLATION,
      EmailNotificationSubCategoryKey.BOOKING_CANCELLATION_BY_ADMIN,
      EmailNotificationSubCategoryKey.BOOKING_CONFIRMATION_F2F,
      EmailNotificationSubCategoryKey.BOOKING_CONFIRMATION_VIRTUAL,
      EmailNotificationSubCategoryKey.BOOKING_INSTRUCTOR_CHANGED,
      EmailNotificationSubCategoryKey.BOOKING_SCHEDULE_CHANGED,
      EmailNotificationSubCategoryKey.CERTIFICATE_UNLOCKED,
      EmailNotificationSubCategoryKey.MEMBERSHIP_BUY_NEW_PACKAGE,
      EmailNotificationSubCategoryKey.MEMBERSHIP_COMPLETED_ALL_COURSES,
      EmailNotificationSubCategoryKey.MEMBERSHIP_EXPIRY_REMINDER,
      EmailNotificationSubCategoryKey.MEMBERSHIP_RESET_PASSWORD,
      EmailNotificationSubCategoryKey.MEMBERSHIP_SET_PASSWORD,
      EmailNotificationSubCategoryKey.MEMBERSHIP_VERIFY_EMAIL,
      EmailNotificationSubCategoryKey.MEMBERSHIP_WELCOME,
      EmailNotificationSubCategoryKey.REMINDER_ACTIVATE_ACCOUNT,
      EmailNotificationSubCategoryKey.REMINDER_BOOKING_AFTER_INACTIVE,
      EmailNotificationSubCategoryKey.REMINDER_BOOK_SESSION_F2F,
      EmailNotificationSubCategoryKey.REMINDER_BOOK_SESSION_VIRTUAL,
      EmailNotificationSubCategoryKey.REMINDER_COMPLETE_ASSIGNED_COURSE,
      EmailNotificationSubCategoryKey.REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK,
      EmailNotificationSubCategoryKey.REMINDER_QUIZ_AFTER_SESSION,
      EmailNotificationSubCategoryKey.REMINDER_TODO_ASSESSMENT,
    ];
    const promiseUpdateEmailNotifications = emailUpdateKeys
      .filter((key) => !!EmailNotificationSeedData[key])
      .map((key) => {
        return queryRunner.query(
          `
        UPDATE "email_notification"
        SET "availableVariables" = $1
        FROM (
          SELECT id FROM "email_notification_sub_category" WHERE "email_notification_sub_category"."key" = $2
        ) AS "category"
        WHERE "email_notification"."categoryId" = "category"."id"`,
          [
            JSON.stringify(EmailNotificationSeedData[key].availableVariables),
            key,
          ],
        );
      });
    await Promise.all(promiseUpdateEmailNotifications);

    // Fixing wrong text.
    await queryRunner.query(
      `
      WITH "booking_cancelled_by_admin_content" AS ( 
        SELECT
          "id"
        FROM
          "push_notification_sub_category"
        WHERE
          "push_notification_sub_category"."key" = 'learningActivityBookingCancelledByAdmin'
      )

      UPDATE
        "language"
      SET
        "nameEn" = $1,
        "nameTh" = $2,
        "updatedAt" = NOW()
      WHERE
        "language".id = (
          SELECT
            "contentId"
          FROM
            "push_notification"
          WHERE
            "push_notification"."categoryId" = (
              SELECT
                "id"
              FROM
                "booking_cancelled_by_admin_content"
            )
        );
    `,
      [
        PushNotificationSeedData[
          PushNotificationSubCategoryKey
            .LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_ADMIN
        ].en,
        PushNotificationSeedData[
          PushNotificationSubCategoryKey
            .LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_ADMIN
        ].th,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "push_notification" DROP COLUMN "availableVariables"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" DROP COLUMN "availableVariables"`,
    );
  }
}
