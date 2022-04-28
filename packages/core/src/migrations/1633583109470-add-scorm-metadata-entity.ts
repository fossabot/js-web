import { MigrationInterface, QueryRunner } from 'typeorm';

export class addScormMetadataEntity1633583109470 implements MigrationInterface {
  name = 'addScormMetadataEntity1633583109470';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_scorm_metadata_version_enum" AS ENUM('1.2', 'CAM 1.3', '2004 3rd Edition', '2004 4th Edition')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_scorm_metadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "metadata" jsonb NOT NULL DEFAULT '{}', "status" character varying(200) NOT NULL DEFAULT '', "location" character varying(200) NOT NULL DEFAULT '', "suspend_data" text NOT NULL DEFAULT '', "version" "user_scorm_metadata_version_enum", "userCourseOutlineProgressId" uuid NOT NULL, CONSTRAINT "user_scorm_metadata_unique" UNIQUE ("userCourseOutlineProgressId"), CONSTRAINT "REL_8d09342ba4c44181c66994c506" UNIQUE ("userCourseOutlineProgressId"), CONSTRAINT "PK_67c55b0ffa0d533e177e3bf8896" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_scorm_metadata" ADD CONSTRAINT "FK_8d09342ba4c44181c66994c5060" FOREIGN KEY ("userCourseOutlineProgressId") REFERENCES "user_course_outline_progress"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_scorm_metadata" DROP CONSTRAINT "FK_8d09342ba4c44181c66994c5060"`,
    );
    await queryRunner.query(`DROP TABLE "user_scorm_metadata"`);
    await queryRunner.query(`DROP TYPE "user_scorm_metadata_version_enum"`);
  }
}
