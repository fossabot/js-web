import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateDefaultIssuetaxinvoice1625823686369
  implements MigrationInterface
{
  name = 'updateDefaultIssuetaxinvoice1625823686369';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "issueTaxInvoice" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "issueTaxInvoice" SET DEFAULT false`,
    );
  }
}
