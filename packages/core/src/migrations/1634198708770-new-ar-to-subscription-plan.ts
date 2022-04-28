import { MigrationInterface, QueryRunner } from 'typeorm';

export class newArToSubscriptionPlan1634198708770
  implements MigrationInterface
{
  name = 'newArToSubscriptionPlan1634198708770';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "subscription_plan" SET "productSKUId" = null WHERE 1=1;`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" DROP CONSTRAINT "FK_9d87532eeede0d1c6a7a1bc45db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" ADD CONSTRAINT "FK_9d87532eeede0d1c6a7a1bc45db" FOREIGN KEY ("productSKUId") REFERENCES "product_ar_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" DROP CONSTRAINT "FK_9d87532eeede0d1c6a7a1bc45db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" ADD CONSTRAINT "FK_9d87532eeede0d1c6a7a1bc45db" FOREIGN KEY ("productSKUId") REFERENCES "product_sku_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
