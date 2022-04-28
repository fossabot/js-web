import { MigrationInterface, QueryRunner } from 'typeorm';

export class userArchivedCourse1638430842957 implements MigrationInterface {
  name = 'userArchivedCourse1638430842957';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_archived_course" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "courseId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "user_archived_course_unique" UNIQUE ("courseId", "userId"), CONSTRAINT "PK_3a5dc42e0324c4aa0a7e404a140" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_archived_course" ADD CONSTRAINT "FK_b599981780d447446d88e4d507c" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_archived_course" ADD CONSTRAINT "FK_d0d58ca769e1069f8509670f397" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_archived_course" DROP CONSTRAINT "FK_d0d58ca769e1069f8509670f397"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_archived_course" DROP CONSTRAINT "FK_b599981780d447446d88e4d507c"`,
    );
    await queryRunner.query(`DROP TABLE "user_archived_course"`);
  }
}
