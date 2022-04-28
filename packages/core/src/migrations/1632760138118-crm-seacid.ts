import { MigrationInterface, QueryRunner } from 'typeorm';

export class crmSeacid1632760138118 implements MigrationInterface {
  name = 'crmSeacid1632760138118';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "seacId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_110365b02d2819c9e8b41ae33ab" UNIQUE ("seacId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "contact" ADD "membertype" character varying(20)`,
    );
    await queryRunner.query(`ALTER TABLE "contact" ADD "signupmember" boolean`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "signupmember"`);
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "membertype"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_110365b02d2819c9e8b41ae33ab"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "seacId"`);
  }
}
