import { MigrationInterface, QueryRunner } from 'typeorm';

export class userAssignedLearningTrack1648103281507
  implements MigrationInterface
{
  name = 'userAssignedLearningTrack1648103281507';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_assigned_learning_track_assignmenttype_enum" AS ENUM('optional')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_assigned_learning_track" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "learningTrackId" uuid NOT NULL, "userId" uuid NOT NULL, "assignmentType" "public"."user_assigned_learning_track_assignmenttype_enum" NOT NULL DEFAULT 'optional', "dueDateTime" TIMESTAMP WITH TIME ZONE, CONSTRAINT "user_assigned_learning_track_unique" UNIQUE ("learningTrackId", "userId"), CONSTRAINT "PK_4fc796947e6927e11fb6b494f67" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_assigned_learning_track_upload_history_status_enum" AS ENUM('pending', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_assigned_learning_track_upload_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "file" character varying NOT NULL, "isProcessed" boolean NOT NULL DEFAULT false, "status" "public"."user_assigned_learning_track_upload_history_status_enum" NOT NULL DEFAULT 'pending', "s3key" character varying NOT NULL, "error" text, "uploadedById" uuid NOT NULL, CONSTRAINT "PK_0b710890a93916353c2b865ba45" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fd7249d1935e24cc7b39cbbafb" ON "user_assigned_learning_track_upload_history" ("s3key") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_assigned_learning_track" ADD CONSTRAINT "FK_73f712cab4f06a4e1de6736ce12" FOREIGN KEY ("learningTrackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_assigned_learning_track" ADD CONSTRAINT "FK_d33e90dcc7d060e0b031115a234" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_assigned_learning_track_upload_history" ADD CONSTRAINT "FK_3af7d5828a1614843d3797b736b" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_assigned_learning_track_upload_history" DROP CONSTRAINT "FK_3af7d5828a1614843d3797b736b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_assigned_learning_track" DROP CONSTRAINT "FK_d33e90dcc7d060e0b031115a234"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_assigned_learning_track" DROP CONSTRAINT "FK_73f712cab4f06a4e1de6736ce12"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fd7249d1935e24cc7b39cbbafb"`,
    );
    await queryRunner.query(
      `DROP TABLE "user_assigned_learning_track_upload_history"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_assigned_learning_track_upload_history_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "user_assigned_learning_track"`);
    await queryRunner.query(
      `DROP TYPE "public"."user_assigned_learning_track_assignmenttype_enum"`,
    );
  }
}
