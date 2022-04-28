import { MigrationInterface, QueryRunner } from 'typeorm';
import { PushNotificationSubCategoryKey } from '../notification/enum/PushNotificationSubCategory.enum';
import { PushNotificationSeedData } from '../notification/seed-data/PushNotificationSeedData';

export class addSystemAnnouncementEnum1650286085778
  implements MigrationInterface
{
  name = 'addSystemAnnouncementEnum1650286085778';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const content =
      PushNotificationSeedData[
        PushNotificationSubCategoryKey.SYSTEM_ANNOUNCEMENT
      ];

    await queryRunner.query(
      `ALTER TYPE "public"."push_notification_category_key_enum" RENAME TO "push_notification_category_key_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."push_notification_category_key_enum" AS ENUM('assignment', 'certificate', 'learningActivity', 'membership', 'reminder', 'systemAnnouncement')`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification_category" ALTER COLUMN "key" TYPE "public"."push_notification_category_key_enum" USING "key"::"text"::"public"."push_notification_category_key_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."push_notification_category_key_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."push_notification_sub_category_key_enum" RENAME TO "push_notification_sub_category_key_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."push_notification_sub_category_key_enum" AS ENUM('learningActivityCourseEnrollment', 'learningActivityCourseCompletion', 'learningActivityLearningTrackEnrollment', 'learningActivityLearningTrackCompletion', 'learningActivitySessionBooked', 'learningActivityBookingCancelledByUser', 'learningActivitySessionCancelledByAdmin', 'learningActivityBookingCancelledByAdmin', 'assignmentSession', 'assignmentCourse', 'assignmentLearningTrack', 'membershipRenewal', 'membershipActivated', 'membershipExpiringRemider', 'certificateUnlocked', 'reminderCompleteRequiredCourse', 'reminderCompleteRequiredLearningTrack', 'reminderUpcomingBookedEvent', 'reminderAssessmentResultRequired', 'reminderAssessmentUnlocked', 'systemAnnouncement')`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification_sub_category" ALTER COLUMN "key" TYPE "public"."push_notification_sub_category_key_enum" USING "key"::"text"::"public"."push_notification_sub_category_key_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."push_notification_sub_category_key_enum_old"`,
    );

    await queryRunner.query(
      `
        DO $$
        DECLARE
            lang_id uuid;
            sub_category_id uuid;
        BEGIN
            INSERT INTO "push_notification_sub_category" ("name", "key", "parentId")
        SELECT
            'System Announcement',
            'systemAnnouncement',
            "id"
        FROM
            "push_notification_category"
        WHERE
            "push_notification_category"."key" = 'systemAnnouncement'
        ON CONFLICT ("key") DO NOTHING
        RETURNING "push_notification_sub_category"."id" INTO sub_category_id;

        IF sub_category_id IS NOT NULL THEN
            INSERT INTO "language" ("nameEn", "nameTh")
            SELECT (E'${content.en}'), (E'${content.th}')
            RETURNING "language"."id" INTO lang_id;

            INSERT INTO push_notification ("title", "categoryId", "contentId", "triggerTypeId", "availableVariables")
            SELECT 'System Announcement', sub_category_id, lang_id,
            (
                SELECT "id"
                FROM "notification_trigger_type"
                WHERE "notification_trigger_type"."displayName" = 'Immediately'
            ),
            '${JSON.stringify(
              PushNotificationSeedData[
                PushNotificationSubCategoryKey.SYSTEM_ANNOUNCEMENT
              ].availableVariables,
            )}';

        END IF;

        END;
        $$
        LANGUAGE plpgsql;
        `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      DELETE FROM "push_notification"
      WHERE "push_notification"."categoryId" IN(
		    SELECT "id" AS "categoryId"
        FROM "push_notification_sub_category"
		    WHERE "push_notification_sub_category"."key" = 'systemAnnouncement')
      `,
    );

    await queryRunner.query(
      `DELETE FROM "push_notification_sub_category" WHERE "push_notification_sub_category"."key" = 'systemAnnouncement'`,
    );

    await queryRunner.query(
      `DELETE FROM "push_notification_category" WHERE "push_notification_category"."key" = 'systemAnnouncement'`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."push_notification_sub_category_key_enum_old" AS ENUM('learningActivityCourseEnrollment', 'learningActivityCourseCompletion', 'learningActivityLearningTrackEnrollment', 'learningActivityLearningTrackCompletion', 'learningActivitySessionBooked', 'learningActivityBookingCancelledByUser', 'learningActivitySessionCancelledByAdmin', 'learningActivityBookingCancelledByAdmin', 'assignmentSession', 'assignmentCourse', 'assignmentLearningTrack', 'membershipRenewal', 'membershipActivated', 'membershipExpiringRemider', 'certificateUnlocked', 'reminderCompleteRequiredCourse', 'reminderCompleteRequiredLearningTrack', 'reminderUpcomingBookedEvent', 'reminderAssessmentResultRequired', 'reminderAssessmentUnlocked')`,
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
    await queryRunner.query(
      `CREATE TYPE "public"."push_notification_category_key_enum_old" AS ENUM('assignment', 'certificate', 'learningActivity', 'membership', 'reminder')`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification_category" ALTER COLUMN "key" TYPE "public"."push_notification_category_key_enum_old" USING "key"::"text"::"public"."push_notification_category_key_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."push_notification_category_key_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."push_notification_category_key_enum_old" RENAME TO "push_notification_category_key_enum"`,
    );
  }
}
