import { MigrationInterface, QueryRunner } from 'typeorm';
import { PushNotificationSubCategoryKey } from '../notification/enum/PushNotificationSubCategory.enum';
import { PushNotificationSeedData } from '../notification/seed-data/PushNotificationSeedData';

export class add7DaysBeforeTrigger1649489079881 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (process.env.NODE_ENV !== 'test')
      await queryRunner.query(
        `
      	DO $$
        DECLARE
            sub_category_id uuid;
            notification_trigger_id uuid;
        BEGIN
			    SELECT id FROM notification_trigger_type
			    WHERE notification_trigger_type."triggerSeconds" = '{-604800}'
			    INTO notification_trigger_id;

          IF notification_trigger_id IS NULL THEN
			      INSERT INTO notification_trigger_type("displayName", "triggerSeconds")
			      SELECT '7 days before expiry/due date', '{-604800}'
			      RETURNING notification_trigger_type.id INTO notification_trigger_id;
          END IF;

          SELECT id FROM push_notification_sub_category
          WHERE push_notification_sub_category."key" = 'membershipExpiringRemider'
          INTO sub_category_id;

          UPDATE push_notification
          SET "triggerTypeId" = notification_trigger_id
          WHERE push_notification."categoryId" = sub_category_id;

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
          push_notification_sub_category."key" = 'learningActivityBookingCancelledByAdmin'
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
            push_notification."categoryId" = (
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
      WITH assigned_to_session_content AS (
        SELECT
          "id"
        FROM
          push_notification_sub_category
        WHERE
          push_notification_sub_category."key" = 'assignmentSession'
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
                assigned_to_session_content
            )
        );
    `,
      [
        PushNotificationSeedData[
          PushNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION
        ].en,
        PushNotificationSeedData[
          PushNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION
        ].th,
      ],
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
