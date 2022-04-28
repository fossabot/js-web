import { MigrationInterface, QueryRunner } from 'typeorm';

export class courseSessionBookingUniqueIndex1646018803831
  implements MigrationInterface
{
  name = 'courseSessionBookingUniqueIndex1646018803831';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Delete duplicated session booking before create unique index.
    await queryRunner.query(
      `DELETE FROM "course_session_booking"
      USING (
        SELECT ROW_NUMBER() OVER(PARTITION BY "studentId", "courseSessionId") AS "row_number", "id"
        FROM "course_session_booking"
      ) "dup_table"
      WHERE "course_session_booking"."id" = "dup_table"."id" AND "dup_table"."row_number" > 1`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_16152fced7dcc54196c5605ce8" ON "group_user" ("userId", "groupId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "course_session_booking" ADD CONSTRAINT "course_session_booking_unique" UNIQUE ("studentId", "courseSessionId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_session_booking" DROP CONSTRAINT "course_session_booking_unique"`,
    );
  }
}
