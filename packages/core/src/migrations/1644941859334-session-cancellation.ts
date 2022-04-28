import { MigrationInterface, QueryRunner } from 'typeorm';

export class sessionCancelBy1644941859334 implements MigrationInterface {
  name = 'sessionCancelBy1644941859334';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_session" ADD "cancelled" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_course_session_cancellation_log" ADD "reason" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_course_session_cancellation_log" ADD "cancelledByUserId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_course_session_cancellation_log" ADD CONSTRAINT "FK_f1b4db54e0bca177b29beaaa157" FOREIGN KEY ("cancelledByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `UPDATE "user_course_session_cancellation_log" SET "cancelledByUserId" = "user_course_session_cancellation_log"."userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_course_session_cancellation_log" ALTER COLUMN "cancelledByUserId" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_course_session_cancellation_log" DROP CONSTRAINT "FK_f1b4db54e0bca177b29beaaa157"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_course_session_cancellation_log" DROP COLUMN "cancelledByUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_course_session_cancellation_log" DROP COLUMN "reason"`,
    );
  }
}
