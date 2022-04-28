import { MigrationInterface, QueryRunner } from 'typeorm';

export class subscriptionplanDuration1635755761477
  implements MigrationInterface
{
  name = 'subscriptionplanDuration1635755761477';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" ADD "periodDay" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" ADD "periodMonth" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" ADD "periodYear" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" DROP COLUMN "periodYear"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" DROP COLUMN "periodMonth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" DROP COLUMN "periodDay"`,
    );
  }
}
