import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeMobileImage1632285702091 implements MigrationInterface {
  name = 'removeMobileImage1632285702091';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" DROP COLUMN "mobileImageKey"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" ADD "mobileImageKey" character varying(200)`,
    );
  }
}
