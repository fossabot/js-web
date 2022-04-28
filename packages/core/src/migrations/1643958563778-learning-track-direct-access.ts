import { MigrationInterface, QueryRunner } from 'typeorm';

export class learningTrackDirectAccess1643958563778
  implements MigrationInterface
{
  name = 'learningTrackDirectAccess1643958563778';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."learning_track_direct_access_accessortype_enum" AS ENUM('user', 'group', 'organization')`,
    );
    await queryRunner.query(
      `CREATE TABLE "learning_track_direct_access" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "accessorId" uuid NOT NULL, "accessorType" "public"."learning_track_direct_access_accessortype_enum" NOT NULL, "expiryDateTime" TIMESTAMP WITH TIME ZONE NOT NULL, "learningTrackId" uuid NOT NULL, CONSTRAINT "PK_db4dbeaf7cb277201d6b6688752" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cd636eb0e9186df32e8092b836" ON "learning_track_direct_access" ("accessorType") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."learning_track_direct_access_upload_history_status_enum" AS ENUM('pending', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "learning_track_direct_access_upload_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "file" character varying NOT NULL, "isProcessed" boolean NOT NULL DEFAULT false, "status" "public"."learning_track_direct_access_upload_history_status_enum" NOT NULL DEFAULT 'pending', "s3key" character varying NOT NULL, "error" text, "uploadedById" uuid NOT NULL, CONSTRAINT "PK_fa41d5a56a86713315e4b1c714e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a95fcdab0f1222b99f7407f302" ON "learning_track_direct_access_upload_history" ("s3key") `,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_direct_access" ADD CONSTRAINT "FK_a57bc003dc000d24d5f32e2f77e" FOREIGN KEY ("learningTrackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_direct_access_upload_history" ADD CONSTRAINT "FK_2039d1f585658ae4bd6e4ebe77a" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "learning_track_direct_access_upload_history" DROP CONSTRAINT "FK_2039d1f585658ae4bd6e4ebe77a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_direct_access" DROP CONSTRAINT "FK_a57bc003dc000d24d5f32e2f77e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a95fcdab0f1222b99f7407f302"`,
    );
    await queryRunner.query(
      `DROP TABLE "learning_track_direct_access_upload_history"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."learning_track_direct_access_upload_history_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cd636eb0e9186df32e8092b836"`,
    );
    await queryRunner.query(`DROP TABLE "learning_track_direct_access"`);
    await queryRunner.query(
      `DROP TYPE "public"."learning_track_direct_access_accessortype_enum"`,
    );
  }
}
