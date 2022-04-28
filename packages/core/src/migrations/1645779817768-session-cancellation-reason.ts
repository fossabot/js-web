import { MigrationInterface, QueryRunner } from 'typeorm';

export class sessionCancellationReason1645779817768
  implements MigrationInterface
{
  name = 'sessionCancellationReason1645779817768';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_course_session_cancellation_log" DROP COLUMN "reason"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_course_session_cancellation_log_reason_enum" AS ENUM('CancelledByUser', 'CancelledByAdmin', 'CancelledSession')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_course_session_cancellation_log" ADD "reason" "public"."user_course_session_cancellation_log_reason_enum" NOT NULL DEFAULT 'CancelledByUser'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_course_session_cancellation_log" DROP COLUMN "reason"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_course_session_cancellation_log_reason_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_course_session_cancellation_log" ADD "reason" character varying`,
    );
  }
}
