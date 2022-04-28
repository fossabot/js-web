import { MigrationInterface, QueryRunner } from 'typeorm';

export class invitationChange1624948447312 implements MigrationInterface {
  name = 'invitationChange1624948447312';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" ADD "isDefaultPackage" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" ADD "userId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" DROP COLUMN "isDefaultPackage"`,
    );
  }
}
