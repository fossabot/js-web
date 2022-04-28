import { MigrationInterface, QueryRunner } from 'typeorm';

export class userTaxinvoice1632986510784 implements MigrationInterface {
  name = 'userTaxinvoice1632986510784';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_tax_invoice_taxtype_enum" AS ENUM('ORGANIZATION', 'INDIVIDUAL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_tax_invoice_officetype_enum" AS ENUM('HEAD_OFFICE', 'BRANCH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_tax_invoice" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "taxType" "user_tax_invoice_taxtype_enum" NOT NULL, "officeType" "user_tax_invoice_officetype_enum" NOT NULL, "taxEntityName" character varying(255) NOT NULL, "headOfficeOrBranch" character varying(255), "taxId" character varying(255) NOT NULL, "taxAddress" text NOT NULL, "country" character varying(255) NOT NULL, "zipCode" character varying(255) NOT NULL, "contactPerson" text NOT NULL, "contactPhoneNumber" text NOT NULL, "contactemail" citext NOT NULL, "isDefault" boolean NOT NULL, "districtId" integer, "subdistrictId" integer, "provinceId" integer, "userId" uuid, "billingAddressId" uuid, CONSTRAINT "email_check" CHECK (contactemail ~* '^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}$'), CONSTRAINT "PK_1b01a64eec33c85c3686cd0bf2a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tax_invoice" ADD CONSTRAINT "FK_a19819dd3458a01ad4eba9ff87e" FOREIGN KEY ("districtId") REFERENCES "district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tax_invoice" ADD CONSTRAINT "FK_5e2251799e64b5a9b00b965547a" FOREIGN KEY ("subdistrictId") REFERENCES "subdistrict"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tax_invoice" ADD CONSTRAINT "FK_d5499bf73368d9a81bcccfada54" FOREIGN KEY ("provinceId") REFERENCES "province"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tax_invoice" ADD CONSTRAINT "FK_ce2136ceed1884e164edeeddba2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tax_invoice" ADD CONSTRAINT "FK_5ade97864cd952cc1703c91bc2c" FOREIGN KEY ("billingAddressId") REFERENCES "billing_address"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_tax_invoice" DROP CONSTRAINT "FK_5ade97864cd952cc1703c91bc2c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tax_invoice" DROP CONSTRAINT "FK_ce2136ceed1884e164edeeddba2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tax_invoice" DROP CONSTRAINT "FK_d5499bf73368d9a81bcccfada54"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tax_invoice" DROP CONSTRAINT "FK_5e2251799e64b5a9b00b965547a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tax_invoice" DROP CONSTRAINT "FK_a19819dd3458a01ad4eba9ff87e"`,
    );
    await queryRunner.query(`DROP TABLE "user_tax_invoice"`);
    await queryRunner.query(`DROP TYPE "user_tax_invoice_officetype_enum"`);
    await queryRunner.query(`DROP TYPE "user_tax_invoice_taxtype_enum"`);
  }
}
