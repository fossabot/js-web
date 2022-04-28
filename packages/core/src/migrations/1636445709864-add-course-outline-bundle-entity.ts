import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCourseOutlineBundleEntity1636445709864
  implements MigrationInterface
{
  name = 'addCourseOutlineBundleEntity1636445709864';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "course_outline_bundle" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "name" text NOT NULL, CONSTRAINT "PK_5259cdfff0c77889eaa5c175f48" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_outline_bundle_item" ("courseOutlineBundleId" uuid NOT NULL, "courseOutlineId" uuid NOT NULL, CONSTRAINT "PK_24c64e66074b460ab4d378a7183" PRIMARY KEY ("courseOutlineBundleId", "courseOutlineId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_97269df0b0aacd4d53b4ccfea4" ON "course_outline_bundle_item" ("courseOutlineBundleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_020e94b6449307af3c9d6308ae" ON "course_outline_bundle_item" ("courseOutlineId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline_bundle_item" ADD CONSTRAINT "FK_97269df0b0aacd4d53b4ccfea44" FOREIGN KEY ("courseOutlineBundleId") REFERENCES "course_outline_bundle"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline_bundle_item" ADD CONSTRAINT "FK_020e94b6449307af3c9d6308aef" FOREIGN KEY ("courseOutlineId") REFERENCES "course_outline"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_outline_bundle_item" DROP CONSTRAINT "FK_020e94b6449307af3c9d6308aef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline_bundle_item" DROP CONSTRAINT "FK_97269df0b0aacd4d53b4ccfea44"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_020e94b6449307af3c9d6308ae"`);
    await queryRunner.query(`DROP INDEX "IDX_97269df0b0aacd4d53b4ccfea4"`);
    await queryRunner.query(`DROP TABLE "course_outline_bundle_item"`);
    await queryRunner.query(`DROP TABLE "course_outline_bundle"`);
  }
}
