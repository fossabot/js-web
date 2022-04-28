import { MigrationInterface, QueryRunner } from 'typeorm';

export class courseProductMaster1628049967845 implements MigrationInterface {
  name = 'courseProductMaster1628049967845';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" ADD "productMasterId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "UQ_372c80728a16e5935264fc8d378" UNIQUE ("productMasterId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "FK_372c80728a16e5935264fc8d378" FOREIGN KEY ("productMasterId") REFERENCES "product_item_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "FK_372c80728a16e5935264fc8d378"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "UQ_372c80728a16e5935264fc8d378"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP COLUMN "productMasterId"`,
    );
  }
}
