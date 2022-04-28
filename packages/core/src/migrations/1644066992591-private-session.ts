import { MigrationInterface, QueryRunner } from 'typeorm';

export class privateSession1644066992591 implements MigrationInterface {
  name = 'privateSession1644066992591';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_session" ADD "isPrivate" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_session" DROP COLUMN "isPrivate"`,
    );
  }
}
