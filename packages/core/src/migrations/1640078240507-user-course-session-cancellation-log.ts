import { MigrationInterface, QueryRunner } from 'typeorm';

export class userCourseSessionCancellationLog1640078240507
  implements MigrationInterface
{
  name = 'userCourseSessionCancellationLog1640078240507';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_course_session_cancellation_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "userId" uuid NOT NULL, "courseSessionId" uuid NOT NULL, CONSTRAINT "PK_60472ca91fd8ad9421e010cb7bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_course_session_cancellation_log" ADD CONSTRAINT "FK_ef19d4d804cf919ae8eb6130b38" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_course_session_cancellation_log" ADD CONSTRAINT "FK_2aca23c6eb10e405c15887d3363" FOREIGN KEY ("courseSessionId") REFERENCES "course_session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_course_session_cancellation_log" DROP CONSTRAINT "FK_2aca23c6eb10e405c15887d3363"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_course_session_cancellation_log" DROP CONSTRAINT "FK_ef19d4d804cf919ae8eb6130b38"`,
    );
    await queryRunner.query(
      `DROP TABLE "user_course_session_cancellation_log"`,
    );
  }
}
