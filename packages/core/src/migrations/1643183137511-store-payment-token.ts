import { MigrationInterface, QueryRunner } from 'typeorm';

export class storePaymentToken1643183137511 implements MigrationInterface {
  name = 'storePaymentToken1643183137511';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" ADD "paymentToken" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "paymentToken"`);
  }
}
