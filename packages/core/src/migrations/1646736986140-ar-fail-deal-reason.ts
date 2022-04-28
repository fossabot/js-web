import { MigrationInterface, QueryRunner } from 'typeorm';

export class arFailDealReason1646736986140 implements MigrationInterface {
  name = 'arFailDealReason1646736986140';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" ADD "dealId" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "ar_failed_order" ADD "reason" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ar_failed_order" DROP COLUMN "reason"`,
    );
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "dealId"`);
  }
}
