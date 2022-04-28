import { MigrationInterface, QueryRunner } from 'typeorm';

export class preAssessmentCourseRule1642666073108
  implements MigrationInterface
{
  name = 'preAssessmentCourseRule1642666073108';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "course_rule_item_type_enum" RENAME TO "course_rule_item_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "course_rule_item_type_enum" AS ENUM('required', 'book', 'pre-assessment')`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_rule_item" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_rule_item" ALTER COLUMN "type" TYPE "course_rule_item_type_enum" USING "type"::"text"::"course_rule_item_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_rule_item" ALTER COLUMN "type" SET DEFAULT 'required'`,
    );
    await queryRunner.query(`DROP TYPE "course_rule_item_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "course_rule_item_type_enum_old" AS ENUM('required', 'book')`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_rule_item" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_rule_item" ALTER COLUMN "type" TYPE "course_rule_item_type_enum_old" USING "type"::"text"::"course_rule_item_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_rule_item" ALTER COLUMN "type" SET DEFAULT 'required'`,
    );
    await queryRunner.query(`DROP TYPE "course_rule_item_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "course_rule_item_type_enum_old" RENAME TO "course_rule_item_type_enum"`,
    );
  }
}
