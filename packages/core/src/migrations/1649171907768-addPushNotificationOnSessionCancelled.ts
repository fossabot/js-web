import { MigrationInterface, QueryRunner } from 'typeorm';
import { PushNotificationSubCategoryKey } from '../notification/enum/PushNotificationSubCategory.enum';
import { PushNotificationSeedData } from '../notification/seed-data/PushNotificationSeedData';

export class addPushNotificationOnSessionCancelled1649171907768
  implements MigrationInterface
{
  name = 'addPushNotificationOnSessionCancelled1649171907768';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const content =
      PushNotificationSeedData[
        PushNotificationSubCategoryKey
          .LEARNING_ACTIVITY_SESSION_CANCELLED_BY_ADMIN
      ];

    // Delete invalid item before change the column to new enum
    await queryRunner.query(
      `
      DELETE FROM "push_notification"
      WHERE "push_notification"."categoryId" IN(
		    SELECT "id" AS "categoryId"
        FROM "push_notification_sub_category"
		    WHERE "push_notification_sub_category"."key" = 'learningActivityBookingAssignedByUser')
      `,
    );
    // Delete invalid item before change the column to new enum
    await queryRunner.query(
      `DELETE FROM "push_notification_sub_category" WHERE "push_notification_sub_category"."key" = 'learningActivityBookingAssignedByUser'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."push_notification_sub_category_key_enum" RENAME TO "push_notification_sub_category_key_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."push_notification_sub_category_key_enum" AS ENUM('learningActivityCourseEnrollment', 'learningActivityCourseCompletion', 'learningActivityLearningTrackEnrollment', 'learningActivityLearningTrackCompletion', 'learningActivitySessionBooked', 'learningActivityBookingCancelledByUser', 'learningActivitySessionCancelledByAdmin', 'learningActivityBookingCancelledByAdmin', 'assignmentSession', 'assignmentCourse', 'assignmentLearningTrack', 'membershipRenewal', 'membershipActivated', 'membershipExpiringRemider', 'certificateUnlocked', 'reminderCompleteRequiredCourse', 'reminderCompleteRequiredLearningTrack', 'reminderUpcomingBookedEvent', 'reminderAssessmentResultRequired', 'reminderAssessmentUnlocked')`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification_sub_category" ALTER COLUMN "key" TYPE "public"."push_notification_sub_category_key_enum" USING "key"::"text"::"public"."push_notification_sub_category_key_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."push_notification_sub_category_key_enum_old"`,
    );
    // Insert newly added enum notification. In case of having old seed data prior to new enum
    // Parameters doesn't work with plpgsql
    await queryRunner.query(
      `
        DO $$
        DECLARE
            lang_id uuid;
            sub_category_id uuid;
        BEGIN
            INSERT INTO "push_notification_sub_category" ("name", "key", "parentId")
        SELECT
            'Session cancelled by admin',
            'learningActivitySessionCancelledByAdmin',
            "id"
        FROM
            "push_notification_category"
        WHERE
            "push_notification_category"."key" = 'learningActivity'
        ON CONFLICT ("key") DO NOTHING
        RETURNING "push_notification_sub_category"."id" INTO sub_category_id;

        IF sub_category_id IS NOT NULL THEN
            INSERT INTO "language" ("nameEn", "nameTh")
            SELECT (E'${content.en}'), (E'${content.th}')
            RETURNING "language"."id" INTO lang_id;

            INSERT INTO push_notification ("title", "categoryId", "contentId", "triggerTypeId")
            SELECT 'Session cancelled by admin', sub_category_id, lang_id,
            (
                SELECT "id"
                FROM "notification_trigger_type"
                WHERE "notification_trigger_type"."displayName" = 'Immediately'
            );
        END IF;

        END;
        $$
        LANGUAGE plpgsql;
        `,
    );
    await queryRunner.query(
      `
      WITH booking_cancelled_by_admin_content AS ( 
        SELECT
          "id"
        FROM
          push_notification_sub_category
        WHERE
          push_notification_sub_category. "key" = 'learningActivityBookingCancelledByAdmin'
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
            push_notification
          WHERE
            push_notification. "categoryId" = (
              SELECT
                "id"
              FROM
                booking_cancelled_by_admin_content
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
    await queryRunner.query(
      `
      WITH booking_cancelled_by_user_content AS ( 
        SELECT
          "id"
        FROM
          push_notification_sub_category
        WHERE
          push_notification_sub_category. "key" = 'learningActivityBookingCancelledByUser'
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
            push_notification
          WHERE
            push_notification. "categoryId" = (
              SELECT
                "id"
              FROM
                booking_cancelled_by_user_content
            )
        );
    `,
      [
        PushNotificationSeedData[
          PushNotificationSubCategoryKey
            .LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_USER
        ].en,
        PushNotificationSeedData[
          PushNotificationSubCategoryKey
            .LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_USER
        ].th,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete invalid item before revert the column to old enum
    await queryRunner.query(
      `
      DELETE FROM "push_notification"
      WHERE "push_notification"."categoryId" IN(
		    SELECT "id" AS "categoryId"
        FROM "push_notification_sub_category"
		    WHERE "push_notification_sub_category"."key" = 'learningActivitySessionCancelledByAdmin')
      `,
    );
    // Delete invalid item before revert the column to old enum
    await queryRunner.query(
      `DELETE FROM "push_notification_sub_category" WHERE "push_notification_sub_category"."key" = 'learningActivitySessionCancelledByAdmin'`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."push_notification_sub_category_key_enum_old" AS ENUM('learningActivityCourseEnrollment', 'learningActivityCourseCompletion', 'learningActivityLearningTrackEnrollment', 'learningActivityLearningTrackCompletion', 'learningActivitySessionBooked', 'learningActivityBookingCancelledByUser', 'learningActivityBookingAssignedByUser', 'learningActivityBookingCancelledByAdmin', 'assignmentSession', 'assignmentCourse', 'assignmentLearningTrack', 'membershipRenewal', 'membershipActivated', 'membershipExpiringRemider', 'certificateUnlocked', 'reminderCompleteRequiredCourse', 'reminderCompleteRequiredLearningTrack', 'reminderUpcomingBookedEvent', 'reminderAssessmentResultRequired', 'reminderAssessmentUnlocked')`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification_sub_category" ALTER COLUMN "key" TYPE "public"."push_notification_sub_category_key_enum_old" USING "key"::"text"::"public"."push_notification_sub_category_key_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."push_notification_sub_category_key_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."push_notification_sub_category_key_enum_old" RENAME TO "push_notification_sub_category_key_enum"`,
    );
  }
}
