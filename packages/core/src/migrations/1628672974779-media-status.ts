import { MigrationInterface, QueryRunner } from 'typeorm';

export class mediaStatus1628672974779 implements MigrationInterface {
  name = 'mediaStatus1628672974779';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "media" ADD "status" character varying NOT NULL DEFAULT 'CREATED'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "status"`);
  }
}
