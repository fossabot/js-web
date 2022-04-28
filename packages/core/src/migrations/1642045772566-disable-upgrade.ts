import { MigrationInterface, QueryRunner } from 'typeorm';

export class disableUpgrade1642045772566 implements MigrationInterface {
  name = 'disableUpgrade1642045772566';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group" ADD "disableUpgrade" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "disableUpgrade" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "disableUpgrade"`,
    );
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "disableUpgrade"`);
  }
}
