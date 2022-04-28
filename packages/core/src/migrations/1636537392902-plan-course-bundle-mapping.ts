import { MigrationInterface, QueryRunner } from 'typeorm';

export class planCourseBundleMapping1636537392902
  implements MigrationInterface
{
  name = 'planCourseBundleMapping1636537392902';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "plan_course_bundle_item" ("subscriptionPlanId" uuid NOT NULL, "courseOutlineBundleId" uuid NOT NULL, CONSTRAINT "PK_fd60fd54ab3ef7f13eee3949399" PRIMARY KEY ("subscriptionPlanId", "courseOutlineBundleId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9a9eb7b5b6630630afb4c1da31" ON "plan_course_bundle_item" ("subscriptionPlanId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9a9ee0cba2366e03d13206db65" ON "plan_course_bundle_item" ("courseOutlineBundleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_course_bundle_item" ADD CONSTRAINT "FK_9a9eb7b5b6630630afb4c1da318" FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plan"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_course_bundle_item" ADD CONSTRAINT "FK_9a9ee0cba2366e03d13206db650" FOREIGN KEY ("courseOutlineBundleId") REFERENCES "course_outline_bundle"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "plan_course_bundle_item" DROP CONSTRAINT "FK_9a9ee0cba2366e03d13206db650"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_course_bundle_item" DROP CONSTRAINT "FK_9a9eb7b5b6630630afb4c1da318"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_9a9ee0cba2366e03d13206db65"`);
    await queryRunner.query(`DROP INDEX "IDX_9a9eb7b5b6630630afb4c1da31"`);
    await queryRunner.query(`DROP TABLE "plan_course_bundle_item"`);
  }
}
