import { MigrationInterface, QueryRunner } from 'typeorm';

export class certificateUnlockRule1640222852454 implements MigrationInterface {
  name = 'certificateUnlockRule1640222852454';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "certificate_unlock_rule_course_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "unlockRuleId" uuid NOT NULL, "courseId" uuid NOT NULL, "percentage" integer NOT NULL DEFAULT '100', CONSTRAINT "certificate_unlock_rule_course_item_unique" UNIQUE ("unlockRuleId", "courseId"), CONSTRAINT "PK_07a99265889e3f3ca0cb8e443e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "certificate_unlock_rule_learning_track_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "unlockRuleId" uuid NOT NULL, "learningTrackId" uuid NOT NULL, "percentage" integer NOT NULL DEFAULT '100', CONSTRAINT "certificate_unlock_rule_learning_track_item_unique" UNIQUE ("unlockRuleId", "learningTrackId"), CONSTRAINT "PK_11a626c3021c996d6bfa9b92684" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "certificate_unlock_rule_unlocktype_enum" AS ENUM('course', 'learningTrack')`,
    );
    await queryRunner.query(
      `CREATE TABLE "certificate_unlock_rule" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "certificateId" uuid NOT NULL, "ruleName" character varying NOT NULL, "unlockType" "certificate_unlock_rule_unlocktype_enum" NOT NULL, "createdById" uuid NOT NULL, "lastModifiedById" uuid NOT NULL, CONSTRAINT "PK_c7aa7a04842b370e0d643b58bea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d9b3ad68885729db0fdd972bfb" ON "certificate_unlock_rule" ("unlockType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_414e643fda739fa06d867e15fd" ON "course_direct_access" ("accessorType") `,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate_unlock_rule_course_item" ADD CONSTRAINT "FK_cb38a26adbf8c5f078474fd18e9" FOREIGN KEY ("unlockRuleId") REFERENCES "certificate_unlock_rule"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate_unlock_rule_course_item" ADD CONSTRAINT "FK_712f8d88de239cc367b279c5f5b" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate_unlock_rule_learning_track_item" ADD CONSTRAINT "FK_1859863ffdcd2f775b3103ce5f8" FOREIGN KEY ("unlockRuleId") REFERENCES "certificate_unlock_rule"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate_unlock_rule_learning_track_item" ADD CONSTRAINT "FK_8350b4b8987505c2896496ba643" FOREIGN KEY ("learningTrackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate_unlock_rule" ADD CONSTRAINT "FK_f2929451b4979c6f0e429fef4f3" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate_unlock_rule" ADD CONSTRAINT "FK_661d9d582d30fcd6ef8f72a43ac" FOREIGN KEY ("lastModifiedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate_unlock_rule" ADD CONSTRAINT "FK_1dee28d3d5a20331b842567c558" FOREIGN KEY ("certificateId") REFERENCES "certificate"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "certificate_unlock_rule" DROP CONSTRAINT "FK_1dee28d3d5a20331b842567c558"`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate_unlock_rule" DROP CONSTRAINT "FK_661d9d582d30fcd6ef8f72a43ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate_unlock_rule" DROP CONSTRAINT "FK_f2929451b4979c6f0e429fef4f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate_unlock_rule_learning_track_item" DROP CONSTRAINT "FK_8350b4b8987505c2896496ba643"`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate_unlock_rule_learning_track_item" DROP CONSTRAINT "FK_1859863ffdcd2f775b3103ce5f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate_unlock_rule_course_item" DROP CONSTRAINT "FK_712f8d88de239cc367b279c5f5b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate_unlock_rule_course_item" DROP CONSTRAINT "FK_cb38a26adbf8c5f078474fd18e9"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_414e643fda739fa06d867e15fd"`);
    await queryRunner.query(`DROP INDEX "IDX_d9b3ad68885729db0fdd972bfb"`);
    await queryRunner.query(`DROP TABLE "certificate_unlock_rule"`);
    await queryRunner.query(
      `DROP TYPE "certificate_unlock_rule_unlocktype_enum"`,
    );
    await queryRunner.query(
      `DROP TABLE "certificate_unlock_rule_learning_track_item"`,
    );
    await queryRunner.query(`DROP TABLE "certificate_unlock_rule_course_item"`);
  }
}
