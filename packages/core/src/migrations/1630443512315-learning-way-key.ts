import { MigrationInterface, QueryRunner } from 'typeorm';

export class learningWayKey1630443512315 implements MigrationInterface {
  name = 'learningWayKey1630443512315';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "learning_way_key_enum" AS ENUM('frontLine', 'beeLine', 'onLine', 'inLine')`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_way" ADD "key" "learning_way_key_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "learning_way" DROP COLUMN "key"`);
    await queryRunner.query(`DROP TYPE "learning_way_key_enum"`);
  }
}
