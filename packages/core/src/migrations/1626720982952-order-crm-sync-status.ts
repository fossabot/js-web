import { MigrationInterface, QueryRunner } from 'typeorm';

export class orderCrmSyncStatus1626720982952 implements MigrationInterface {
  name = 'orderCrmSyncStatus1626720982952';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" ADD "isSyncToCRM" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "isSyncToCRM"`);
  }
}
