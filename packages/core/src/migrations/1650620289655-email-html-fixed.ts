import { MigrationInterface, QueryRunner } from 'typeorm';
import { EmailNotificationSubCategoryKey } from '../notification/enum/EmailNotificationSubCategory.enum';
import { NotificationVariableDict as NV } from '../notification/NotificationVariableDict';
import { EmailNotificationSeedData } from '../notification/seed-data/EmailNotificationSeedData';

export class emailHtmlFixed1650620289655 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update REMINDER_COMPLETE_ASSIGNED_COURSE
    await queryRunner.query(
      `
            UPDATE "email_notification"
            SET "availableVariables" = $1
            FROM (
                SELECT id FROM "email_notification_sub_category" WHERE "email_notification_sub_category"."key" = $2
            ) AS "category"
            WHERE "email_notification"."categoryId" = "category"."id"
        `,
      [
        JSON.stringify([
          NV.FULL_NAME,
          NV.MEMBERSHIP_EXPIRY_DATE,
          NV.COURSE_LIST,
          NV.DASHBOARD_COURSES_LINK,
        ]),
        EmailNotificationSubCategoryKey.REMINDER_COMPLETE_ASSIGNED_COURSE,
      ],
    );

    // Update REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK
    await queryRunner.query(
      `
            UPDATE "email_notification"
            SET "availableVariables" = $1
            FROM (
                SELECT id FROM "email_notification_sub_category" WHERE "email_notification_sub_category"."key" = $2
            ) AS "category"
            WHERE "email_notification"."categoryId" = "category"."id"
        `,
      [
        JSON.stringify([
          NV.FULL_NAME,
          NV.MEMBERSHIP_EXPIRY_DATE,
          NV.LEARNING_TRACK_LIST,
          NV.DASHBOARD_LEARNING_TRACKS_LINK,
        ]),
        EmailNotificationSubCategoryKey.REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK,
      ],
    );

    const emailToUpdate = [
      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE,
      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_LEARNING_TRACK,
      EmailNotificationSubCategoryKey.REMINDER_COMPLETE_ASSIGNED_COURSE,
      EmailNotificationSubCategoryKey.REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK,
    ];
    const promiseSubjects = emailToUpdate.map((key) => {
      return queryRunner.query(
        `
        WITH "content" AS (
          SELECT
            "id"
          FROM
            "email_notification_sub_category"
          WHERE
          "email_notification_sub_category"."key" = $1
        )
  
        UPDATE
          "language"
        SET
          "nameEn" = $2,
          "nameTh" = $3,
          "updatedAt" = NOW()
        WHERE
          "language".id = (
            SELECT
              "subjectId"
            FROM
              "email_notification"
            WHERE
            "email_notification"."categoryId" = (
                SELECT
                  "id"
                FROM
                  "content"
              )
          );
      `,
        [
          key,
          EmailNotificationSeedData[key].en.subject,
          EmailNotificationSeedData[key].th.subject,
        ],
      );
    });
    await Promise.all(promiseSubjects);

    const promiseHTML = emailToUpdate.map((key) => {
      return queryRunner.query(
        `
        WITH "content" AS (
          SELECT
            "id"
          FROM
            "email_notification_sub_category"
          WHERE
          "email_notification_sub_category"."key" = $1
        )
  
        UPDATE
          "language"
        SET
          "nameEn" = $2,
          "nameTh" = $3,
          "updatedAt" = NOW()
        WHERE
          "language".id = (
            SELECT
              "bodyHTMLId"
            FROM
              "email_notification"
            WHERE
            "email_notification"."categoryId" = (
                SELECT
                  "id"
                FROM
                  "content"
              )
          );
      `,
        [
          key,
          EmailNotificationSeedData[key].en.bodyHTML,
          EmailNotificationSeedData[key].th.bodyHTML,
        ],
      );
    });
    await Promise.all(promiseHTML);

    const promiseText = emailToUpdate.map((key) => {
      return queryRunner.query(
        `
        WITH "content" AS (
          SELECT
            "id"
          FROM
            "email_notification_sub_category"
          WHERE
          "email_notification_sub_category"."key" = $1
        )
  
        UPDATE
          "language"
        SET
          "nameEn" = $2,
          "nameTh" = $3,
          "updatedAt" = NOW()
        WHERE
          "language".id = (
            SELECT
              "bodyTextId"
            FROM
              "email_notification"
            WHERE
            "email_notification"."categoryId" = (
                SELECT
                  "id"
                FROM
                  "content"
              )
          );
      `,
        [
          key,
          EmailNotificationSeedData[key].en.bodyText,
          EmailNotificationSeedData[key].th.bodyText,
        ],
      );
    });
    await Promise.all(promiseText);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Update REMINDER_COMPLETE_ASSIGNED_COURSE
    await queryRunner.query(
      `
            UPDATE "email_notification"
            SET "availableVariables" = $1
            FROM (
                SELECT id FROM "email_notification_sub_category" WHERE "email_notification_sub_category"."key" = $2
            ) AS "category"
            WHERE "email_notification"."categoryId" = "category"."id"
        `,
      [
        JSON.stringify([
          NV.FULL_NAME,
          NV.MEMBERSHIP_EXPIRY_DATE,
          NV.COURSE_LIST,
        ]),
        EmailNotificationSubCategoryKey.REMINDER_COMPLETE_ASSIGNED_COURSE,
      ],
    );

    // Update REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK
    await queryRunner.query(
      `
            UPDATE "email_notification"
            SET "availableVariables" = $1
            FROM (
                SELECT id FROM "email_notification_sub_category" WHERE "email_notification_sub_category"."key" = $2
            ) AS "category"
            WHERE "email_notification"."categoryId" = "category"."id"
        `,
      [
        JSON.stringify([
          NV.FULL_NAME,
          NV.MEMBERSHIP_EXPIRY_DATE,
          NV.LEARNING_TRACK_LIST,
        ]),
        EmailNotificationSubCategoryKey.REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK,
      ],
    );
  }
}
