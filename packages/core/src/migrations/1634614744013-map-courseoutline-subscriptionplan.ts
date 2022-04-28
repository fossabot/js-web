import { MigrationInterface, QueryRunner } from 'typeorm';

export class mapCourseoutlineSubscriptionplan1634614744013
  implements MigrationInterface
{
  name = 'mapCourseoutlineSubscriptionplan1634614744013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP CONSTRAINT "FK_5fec35bb3d435ee53c5c4a94b68"`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_outline_subscription_plan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "courseOutlineId" uuid NOT NULL, "subscriptionPlanId" uuid NOT NULL, CONSTRAINT "course_outline_plan" UNIQUE ("courseOutlineId", "subscriptionPlanId"), CONSTRAINT "PK_cfbb7f61b6fbb3e31397dcecf26" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "productItemMasterId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline_subscription_plan" ADD CONSTRAINT "FK_0d5b25978c02ff876329f3ee264" FOREIGN KEY ("courseOutlineId") REFERENCES "course_outline"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline_subscription_plan" ADD CONSTRAINT "FK_221b342af8194a57ed6ae4d4344" FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plan"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_outline_subscription_plan" DROP CONSTRAINT "FK_221b342af8194a57ed6ae4d4344"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline_subscription_plan" DROP CONSTRAINT "FK_0d5b25978c02ff876329f3ee264"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "productItemMasterId" uuid`,
    );
    await queryRunner.query(`DROP TABLE "course_outline_subscription_plan"`);
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD CONSTRAINT "FK_5fec35bb3d435ee53c5c4a94b68" FOREIGN KEY ("productItemMasterId") REFERENCES "product_item_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
