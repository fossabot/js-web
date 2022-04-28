import { MigrationInterface, QueryRunner } from 'typeorm';

export class userAssignedCourse1647843886735 implements MigrationInterface {
  name = 'userAssignedCourse1647843886735';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_assigned_course_assignmenttype_enum" AS ENUM('optional', 'required')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_assigned_course" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "courseId" uuid NOT NULL, "userId" uuid NOT NULL, "assignmentType" "public"."user_assigned_course_assignmenttype_enum" NOT NULL DEFAULT 'optional', "dueDateTime" TIMESTAMP WITH TIME ZONE, CONSTRAINT "user_assigned_course_unique" UNIQUE ("courseId", "userId"), CONSTRAINT "PK_fb050fceabd8c4fc5b10895ffe2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_assigned_course_upload_history_status_enum" AS ENUM('pending', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_assigned_course_upload_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "file" character varying NOT NULL, "isProcessed" boolean NOT NULL DEFAULT false, "status" "public"."user_assigned_course_upload_history_status_enum" NOT NULL DEFAULT 'pending', "s3key" character varying NOT NULL, "error" text, "uploadedById" uuid NOT NULL, CONSTRAINT "PK_b02ff847d770295f9957fa177d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_72c06411eac6b0f7912593c9f9" ON "user_assigned_course_upload_history" ("s3key") `,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_enrolled_learning_track_status_enum" RENAME TO "user_enrolled_learning_track_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_enrolled_learning_track_status_enum" AS ENUM('enrolled', 'inProgress', 'completed', 'archived')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_learning_track" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_learning_track" ALTER COLUMN "status" TYPE "public"."user_enrolled_learning_track_status_enum" USING "status"::"text"::"public"."user_enrolled_learning_track_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_learning_track" ALTER COLUMN "status" SET DEFAULT 'enrolled'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_enrolled_learning_track_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_assigned_course" ADD CONSTRAINT "FK_ca1f798c59304c4c768f4f995bd" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_assigned_course" ADD CONSTRAINT "FK_f97054100621f0ede45aa27f656" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_assigned_course_upload_history" ADD CONSTRAINT "FK_0c08954dc7bcf05cc028172b0f9" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_assigned_course_upload_history" DROP CONSTRAINT "FK_0c08954dc7bcf05cc028172b0f9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_assigned_course" DROP CONSTRAINT "FK_f97054100621f0ede45aa27f656"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_assigned_course" DROP CONSTRAINT "FK_ca1f798c59304c4c768f4f995bd"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_enrolled_learning_track_status_enum_old" AS ENUM('enrolled', 'inProgress', 'completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_learning_track" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_learning_track" ALTER COLUMN "status" TYPE "public"."user_enrolled_learning_track_status_enum_old" USING "status"::"text"::"public"."user_enrolled_learning_track_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_learning_track" ALTER COLUMN "status" SET DEFAULT 'enrolled'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_enrolled_learning_track_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_enrolled_learning_track_status_enum_old" RENAME TO "user_enrolled_learning_track_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_72c06411eac6b0f7912593c9f9"`,
    );
    await queryRunner.query(`DROP TABLE "user_assigned_course_upload_history"`);
    await queryRunner.query(
      `DROP TYPE "public"."user_assigned_course_upload_history_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "user_assigned_course"`);
    await queryRunner.query(
      `DROP TYPE "public"."user_assigned_course_assignmenttype_enum"`,
    );
  }
}
