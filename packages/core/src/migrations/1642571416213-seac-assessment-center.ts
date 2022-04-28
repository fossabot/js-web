import { MigrationInterface, QueryRunner } from 'typeorm';

export class seacAssessmentCenter1642571416213 implements MigrationInterface {
  name = 'seacAssessmentCenter1642571416213';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "assessmentAPIEndpoint" character varying(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "assessmentName" character varying(80)`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "assessmentNotifyEmailStatus" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "assessmentUserCanRetest" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "assessmentUserCanRetest"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "assessmentNotifyEmailStatus"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "assessmentName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "assessmentAPIEndpoint"`,
    );
  }
}
