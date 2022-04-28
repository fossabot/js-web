import { MigrationInterface, QueryRunner } from 'typeorm';
import { PushNotificationSubCategoryKey } from '../notification/enum/PushNotificationSubCategory.enum';
import { PushNotificationSeedData } from '../notification/seed-data/PushNotificationSeedData';

export class insertSystemAnnouncementCategory1650601490292
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const content =
      PushNotificationSeedData[
        PushNotificationSubCategoryKey.SYSTEM_ANNOUNCEMENT
      ];

    await queryRunner.query(
      `
      DO $$
      DECLARE
          category_id uuid;
      BEGIN
          INSERT INTO "push_notification_category" ("name", "key") VALUES('System Announcement','systemAnnouncement')
          ON CONFLICT ("key") DO NOTHING;

          INSERT INTO "notification_trigger_type" ("displayName", "triggerSeconds") VALUES('Immediately', '{0}')
          ON CONFLICT("displayName", "triggerSeconds") DO NOTHING;
      END $$
          `,
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
		  WHERE "push_notification"."categoryId" IN (
        SELECT "id" 
        FROM "push_notification_sub_category"
        WHERE "push_notification_sub_category"."key" = 'systemAnnouncement'
      )
      `,
    );

    await queryRunner.query(
      `
      DELETE FROM "push_notification_sub_category"
      WHERE "push_notification_sub_category"."parentId" IN(
        SELECT "id" AS "categoryId"
        FROM "push_notification_category"
        WHERE "push_notification_category"."key" = 'systemAnnouncement')
      `,
    );

    await queryRunner.query(
      `
      DELETE FROM "push_notification_category"
      WHERE "push_notification_category"."key" = 'systemAnnouncement';
      `,
    );
  }
}
