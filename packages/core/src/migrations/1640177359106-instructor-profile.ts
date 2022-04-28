import { MigrationInterface, QueryRunner } from 'typeorm';

export class instructorProfile1640177359106 implements MigrationInterface {
  name = 'instructorProfile1640177359106';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "shortSummary" character varying(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "bio" character varying(6000)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "experience" character varying(6000)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "experience"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "bio"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "shortSummary"`);
  }
}
