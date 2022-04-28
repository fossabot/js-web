import { MigrationInterface, QueryRunner } from 'typeorm';

export class courseDuration1631540616594 implements MigrationInterface {
  name = 'courseDuration1631540616594';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "durationInterval"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."course_outline_durationinterval_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "durationValue"`,
    );
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "durationValue"`);
    await queryRunner.query(
      `ALTER TABLE "course" DROP COLUMN "durationInterval"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."course_durationinterval_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "durationMinutes" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "durationHours" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "durationDays" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "durationWeeks" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "durationMonths" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "durationMinutes" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "durationHours" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "durationDays" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "durationWeeks" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "durationMonths" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" DROP COLUMN "durationMonths"`,
    );
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "durationWeeks"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "durationDays"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "durationHours"`);
    await queryRunner.query(
      `ALTER TABLE "course" DROP COLUMN "durationMinutes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "durationMonths"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "durationWeeks"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "durationDays"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "durationHours"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "durationMinutes"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."course_durationinterval_enum" AS ENUM('second', 'minute', 'hour', 'day', 'week', 'month', 'year')`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "durationInterval" "course_durationinterval_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "durationValue" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "durationValue" integer NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."course_outline_durationinterval_enum" AS ENUM('second', 'minute', 'hour', 'day', 'week', 'month', 'year')`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "durationInterval" "course_outline_durationinterval_enum" NOT NULL`,
    );
  }
}
