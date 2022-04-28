import { MigrationInterface, QueryRunner } from 'typeorm';

export class taxinvoiceBilling1625754169539 implements MigrationInterface {
  name = 'taxinvoiceBilling1625754169539';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" ADD "billingAddressId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" ADD CONSTRAINT "FK_faf24d309ba6a29c276ad577290" FOREIGN KEY ("billingAddressId") REFERENCES "billing_address"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" DROP CONSTRAINT "FK_faf24d309ba6a29c276ad577290"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" DROP COLUMN "billingAddressId"`,
    );
  }
}
