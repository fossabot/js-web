import { MigrationInterface, QueryRunner } from 'typeorm';

export class enrolledCourseProgress1640687517432 implements MigrationInterface {
  name = 'enrolledCourseProgress1640687517432';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_enrolled_course_status_enum" AS ENUM('enrolled', 'inProgress', 'completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_course" ADD "status" "user_enrolled_course_status_enum" NOT NULL DEFAULT 'enrolled'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_course" ADD "percentage" integer NOT NULL DEFAULT '0'`,
    );

    // Calculate course progress for non learning event courses. eg: Material, Online Learning and etc.
    await queryRunner.query(
      `
        UPDATE "user_enrolled_course" AS "t1"
        SET
          "percentage" = "t2"."percentage",
          "status" = CASE
                  WHEN "t2"."percentage" <= 0 THEN 'enrolled'::user_enrolled_course_status_enum
                  WHEN "t2"."percentage" >= 100 THEN 'completed'::user_enrolled_course_status_enum
                  ELSE 'inProgress'::user_enrolled_course_status_enum
                END
        FROM
        (
          SELECT DISTINCT
            "co"."courseId" AS "courseId",
            "uec"."userId" AS "userId",
            CEIL(AVG(COALESCE("ucop"."percentage", 0))) AS "percentage"
          FROM "course_outline" "co"
          INNER JOIN "course" "c" ON "c"."id" = "co"."courseId"
          INNER JOIN "user_enrolled_course" "uec" ON "uec"."courseId" = "c"."id"
          INNER JOIN "course_category" "category" ON "c"."categoryId" = "category"."id" AND "category"."key" <> 'learningEvent'
          LEFT JOIN "user_course_outline_progress" "ucop" ON "ucop"."courseOutlineId" = "co"."id" AND "ucop"."userId" = "uec"."userId"
          GROUP BY "co"."courseId", "uec"."userId"
        ) AS "t2"
        WHERE "t1"."courseId" = "t2"."courseId" AND "t1"."userId" = "t2"."userId"
      `,
    );

    // Calculate course progress for learning event courses.
    // Calculate separately between Virtual & Face to Face.
    // Then use the most progress as course progress.
    await queryRunner.query(
      `
        UPDATE "user_enrolled_course" AS "t1"
        SET
          "percentage" = "t2"."percentage",
          "status" = CASE
                  WHEN "t2"."percentage" <= 0 THEN 'enrolled'::user_enrolled_course_status_enum
                  WHEN "t2"."percentage" >= 100 THEN 'completed'::user_enrolled_course_status_enum
                  ELSE 'inProgress'::user_enrolled_course_status_enum
                END
        FROM
        (
          SELECT
          "courseId",
          "userId",
          MAX("percentage") AS "percentage"
        FROM
        (
          SELECT DISTINCT
            "co"."courseId" AS "courseId",
            "uec"."userId" AS "userId",
            "subCategory"."key" AS "subCategoryKey",
            CEIL(AVG(COALESCE("ucop"."percentage", 0))) AS "percentage"
          FROM "course_outline" "co"
          INNER JOIN "course" "c" ON "c"."id" = "co"."courseId"
          INNER JOIN "user_enrolled_course" "uec" ON "uec"."courseId" = "c"."id"
          INNER JOIN "course_category" "category" ON "c"."categoryId" = "category"."id" AND "category"."key" = 'learningEvent'
          LEFT JOIN "course_sub_category" "subCategory" ON "subCategory"."id" = "co"."categoryId"
          LEFT JOIN "user_course_outline_progress" "ucop" ON "ucop"."courseOutlineId" = "co"."id" AND "ucop"."userId" = "uec"."userId"
          GROUP BY "co"."courseId", "uec"."userId", "subCategory"."key"
        ) AS "t1"
        GROUP BY "t1"."courseId", "t1"."userId"
        ) AS "t2"
        WHERE "t1"."courseId" = "t2"."courseId" AND "t1"."userId" = "t2"."userId"  
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_course" DROP COLUMN "percentage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_course" DROP COLUMN "status"`,
    );
    await queryRunner.query(`DROP TYPE "user_enrolled_course_status_enum"`);
  }
}
