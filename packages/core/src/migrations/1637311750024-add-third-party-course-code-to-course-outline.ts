import { MigrationInterface, QueryRunner } from 'typeorm';

export class addThirdPartyCourseCodeToCourseOutline1637311750024
  implements MigrationInterface
{
  name = 'addThirdPartyCourseCodeToCourseOutline1637311750024';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "thirdPartyCourseCode" character varying(80)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "thirdPartyCourseCode"`,
    );
  }
}
