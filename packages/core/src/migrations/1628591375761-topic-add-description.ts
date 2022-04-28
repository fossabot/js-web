import { MigrationInterface, QueryRunner } from 'typeorm';

export class topicAddDescription1628591375761 implements MigrationInterface {
  name = 'topicAddDescription1628591375761';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "topic" ADD "description" text`);
    await queryRunner.query(
      `ALTER TABLE "learning_way" ADD "description" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "learning_way" DROP COLUMN "description"`,
    );
    await queryRunner.query(`ALTER TABLE "topic" DROP COLUMN "description"`);
  }
}
