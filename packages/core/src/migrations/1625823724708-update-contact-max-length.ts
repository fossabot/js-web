import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateContactMaxLength1625823724708 implements MigrationInterface {
  name = 'updateContactMaxLength1625823724708';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "leadmessage"`);
    await queryRunner.query(
      `ALTER TABLE "contact" ADD "leadmessage" character varying(2000)`,
    );
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "taggedurl"`);
    await queryRunner.query(
      `ALTER TABLE "contact" ADD "taggedurl" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "issueTaxInvoice" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "issueTaxInvoice" SET DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "taggedurl"`);
    await queryRunner.query(
      `ALTER TABLE "contact" ADD "taggedurl" character varying(255)`,
    );
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "leadmessage"`);
    await queryRunner.query(
      `ALTER TABLE "contact" ADD "leadmessage" character varying(255)`,
    );
  }
}
