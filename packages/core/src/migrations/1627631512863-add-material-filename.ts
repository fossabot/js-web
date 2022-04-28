import { MigrationInterface, QueryRunner } from 'typeorm';

export class addMaterialFilename1627631512863 implements MigrationInterface {
  name = 'addMaterialFilename1627631512863';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "material" ADD "filename" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "material" DROP COLUMN "filename"`);
  }
}
