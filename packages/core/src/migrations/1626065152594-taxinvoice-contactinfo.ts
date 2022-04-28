import { MigrationInterface, QueryRunner } from 'typeorm';

export class taxinvoiceContactinfo1626065152594 implements MigrationInterface {
  name = 'taxinvoiceContactinfo1626065152594';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "billing_address" DROP CONSTRAINT "email_check"`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_address" DROP COLUMN "email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_address" DROP COLUMN "contactPerson"`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_address" DROP COLUMN "contactNumber"`,
    );
    await queryRunner.query(`ALTER TABLE "tax_invoice" DROP COLUMN "district"`);
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" DROP COLUMN "subDistrict"`,
    );
    await queryRunner.query(`ALTER TABLE "tax_invoice" DROP COLUMN "province"`);
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" ADD "contactPerson" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" ADD "contactPhoneNumber" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" ADD "contactemail" citext NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" ADD "districtId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" ADD "subdistrictId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" ADD "provinceId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" ADD CONSTRAINT "email_check" CHECK (contactemail ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}$')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" ADD CONSTRAINT "FK_52012b9b2b7781575e3eb096658" FOREIGN KEY ("districtId") REFERENCES "district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" ADD CONSTRAINT "FK_04b21f8049523924b27087efe2d" FOREIGN KEY ("subdistrictId") REFERENCES "subdistrict"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" ADD CONSTRAINT "FK_0612fb3861b584ff917e734eeac" FOREIGN KEY ("provinceId") REFERENCES "province"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" DROP CONSTRAINT "FK_0612fb3861b584ff917e734eeac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" DROP CONSTRAINT "FK_04b21f8049523924b27087efe2d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" DROP CONSTRAINT "FK_52012b9b2b7781575e3eb096658"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" DROP CONSTRAINT "email_check"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" DROP COLUMN "provinceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" DROP COLUMN "subdistrictId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" DROP COLUMN "districtId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" DROP COLUMN "contactemail"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" DROP COLUMN "contactPhoneNumber"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" DROP COLUMN "contactPerson"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" ADD "province" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" ADD "subDistrict" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" ADD "district" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_address" ADD "contactNumber" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_address" ADD "contactPerson" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_address" ADD "email" citext NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_address" ADD CONSTRAINT "email_check" CHECK ((email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}$'::citext))`,
    );
  }
}
