import { MigrationInterface, QueryRunner } from 'typeorm';

export class rolePolicyUpdates1637238083960 implements MigrationInterface {
  name = 'rolePolicyUpdates1637238083960';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_policy" DROP CONSTRAINT "FK_30898f089b316e02ecce54e0f01"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy" DROP CONSTRAINT "FK_b5a15c5b7156b43c50c03e769fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role" ADD "isSystemDefined" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_video_course_outline_metadata" ALTER COLUMN "videoProgress" SET DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy" ADD CONSTRAINT "FK_30898f089b316e02ecce54e0f01" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy" ADD CONSTRAINT "FK_b5a15c5b7156b43c50c03e769fe" FOREIGN KEY ("policyId") REFERENCES "policy"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_policy" DROP CONSTRAINT "FK_b5a15c5b7156b43c50c03e769fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy" DROP CONSTRAINT "FK_30898f089b316e02ecce54e0f01"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_video_course_outline_metadata" ALTER COLUMN "videoProgress" DROP DEFAULT`,
    );
    await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "isSystemDefined"`);
    await queryRunner.query(
      `ALTER TABLE "role_policy" ADD CONSTRAINT "FK_b5a15c5b7156b43c50c03e769fe" FOREIGN KEY ("policyId") REFERENCES "policy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy" ADD CONSTRAINT "FK_30898f089b316e02ecce54e0f01" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
