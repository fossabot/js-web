import { MigrationInterface, QueryRunner } from 'typeorm';

export class userCourseProgress1632335195953 implements MigrationInterface {
  name = 'userCourseProgress1632335195953';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_course_outline_progress_status_enum" AS ENUM('enrolled', 'inProgress', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_course_outline_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "status" "user_course_outline_progress_status_enum" NOT NULL, "percentage" integer NOT NULL DEFAULT '0', "userId" uuid NOT NULL, "courseOutlineId" uuid NOT NULL, CONSTRAINT "user_course_outline_progress_unique" UNIQUE ("userId", "courseOutlineId"), CONSTRAINT "PK_db1bb91e1cfaa7e52c4c74a816f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_enrolled_course" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "userId" uuid NOT NULL, "courseId" uuid NOT NULL, CONSTRAINT "user_enrolled_course_unique" UNIQUE ("userId", "courseId"), CONSTRAINT "PK_777d33b7998700940d705c58bcd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_course_outline_progress" ADD CONSTRAINT "FK_fba9b0e22525defbb26e1b6bb29" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_course_outline_progress" ADD CONSTRAINT "FK_e7dd08009fe2a364f1072215f56" FOREIGN KEY ("courseOutlineId") REFERENCES "course_outline"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_course" ADD CONSTRAINT "FK_3a6f6dbaad995367b62094f2253" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_course" ADD CONSTRAINT "FK_6b3e5126a90ceb5cde9167389bf" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_course" DROP CONSTRAINT "FK_6b3e5126a90ceb5cde9167389bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_course" DROP CONSTRAINT "FK_3a6f6dbaad995367b62094f2253"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_course_outline_progress" DROP CONSTRAINT "FK_e7dd08009fe2a364f1072215f56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_course_outline_progress" DROP CONSTRAINT "FK_fba9b0e22525defbb26e1b6bb29"`,
    );
    await queryRunner.query(`DROP TABLE "user_enrolled_course"`);
    await queryRunner.query(`DROP TABLE "user_course_outline_progress"`);
    await queryRunner.query(
      `DROP TYPE "user_course_outline_progress_status_enum"`,
    );
  }
}
