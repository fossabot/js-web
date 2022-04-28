import { MigrationInterface, QueryRunner } from 'typeorm';

export class courseDirectAccess1638306722843 implements MigrationInterface {
  name = 'courseDirectAccess1638306722843';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "course_direct_access_accessortype_enum" AS ENUM('user', 'group', 'organization')`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_direct_access" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "accessorId" uuid NOT NULL, "accessorType" "course_direct_access_accessortype_enum" NOT NULL, "expiryDateTime" TIMESTAMP WITH TIME ZONE NOT NULL, "courseId" uuid NOT NULL, CONSTRAINT "PK_3620fcdb37aa25f543d38d95cf9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "course_direct_access_upload_history_status_enum" AS ENUM('pending', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_direct_access_upload_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "file" character varying NOT NULL, "isProcessed" boolean NOT NULL DEFAULT false, "status" "course_direct_access_upload_history_status_enum" NOT NULL DEFAULT 'pending', "s3key" character varying NOT NULL, "error" text, "uploadedById" uuid NOT NULL, CONSTRAINT "PK_f38d651bc2e7d626f93c101acdb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eadb5955c60cd1bc3b7553129e" ON "course_direct_access_upload_history" ("s3key") `,
    );
    await queryRunner.query(
      `ALTER TABLE "course_direct_access" ADD CONSTRAINT "FK_1b5c1665050ed07c9c606868f56" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_direct_access_upload_history" ADD CONSTRAINT "FK_28981ac602d81030631d4a9d7d7" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_direct_access_upload_history" DROP CONSTRAINT "FK_28981ac602d81030631d4a9d7d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_direct_access" DROP CONSTRAINT "FK_1b5c1665050ed07c9c606868f56"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_eadb5955c60cd1bc3b7553129e"`);
    await queryRunner.query(`DROP TABLE "course_direct_access_upload_history"`);
    await queryRunner.query(
      `DROP TYPE "course_direct_access_upload_history_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "course_direct_access"`);
    await queryRunner.query(
      `DROP TYPE "course_direct_access_accessortype_enum"`,
    );
  }
}
