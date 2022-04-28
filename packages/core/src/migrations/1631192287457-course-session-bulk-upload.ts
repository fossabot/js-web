import { MigrationInterface, QueryRunner } from 'typeorm';

export class courseSessionBulkUpload1631192287457
  implements MigrationInterface
{
  name = 'courseSessionBulkUpload1631192287457';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "course_session_upload_history_status_enum" AS ENUM('pending', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_session_upload_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "file" character varying NOT NULL, "isProcessed" boolean NOT NULL DEFAULT false, "status" "course_session_upload_history_status_enum" NOT NULL DEFAULT 'pending', "s3key" character varying NOT NULL, "error" text, "uploadedById" uuid NOT NULL, CONSTRAINT "PK_ba2c72fa90a9cc6e6fad222b049" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8f091c9235e06b060f0e403999" ON "course_session_upload_history" ("s3key") `,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "language"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."course_outline_language_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "course_session_language_enum" AS ENUM('th', 'en', 'all')`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_session" ADD "language" "course_session_language_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_session_upload_history" ADD CONSTRAINT "FK_85a2b836260f9d6893185a236d3" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_session_upload_history" DROP CONSTRAINT "FK_85a2b836260f9d6893185a236d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_session" DROP COLUMN "language"`,
    );
    await queryRunner.query(`DROP TYPE "course_session_language_enum"`);
    await queryRunner.query(
      `CREATE TYPE "public"."course_outline_language_enum" AS ENUM('th', 'en')`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "language" "course_outline_language_enum"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_8f091c9235e06b060f0e403999"`);
    await queryRunner.query(`DROP TABLE "course_session_upload_history"`);
    await queryRunner.query(
      `DROP TYPE "course_session_upload_history_status_enum"`,
    );
  }
}
