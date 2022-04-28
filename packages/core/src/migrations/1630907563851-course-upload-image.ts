import { MigrationInterface, QueryRunner } from 'typeorm';

export class courseUploadImage1630907563851 implements MigrationInterface {
  name = 'courseUploadImage1630907563851';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_session" RENAME COLUMN "facilitatorUrl" TO "location"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "courseCode" character varying(80)`,
    );
    await queryRunner.query(
      `CREATE TYPE "course_outline_language_enum" AS ENUM('th', 'en')`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "language" "course_outline_language_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "imageKey" character varying(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "mobileImageKey" character varying(200)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" DROP COLUMN "mobileImageKey"`,
    );
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "imageKey"`);
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "language"`,
    );
    await queryRunner.query(`DROP TYPE "course_outline_language_enum"`);
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "courseCode"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_session" RENAME COLUMN "location" TO "facilitatorUrl"`,
    );
  }
}
