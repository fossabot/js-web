import { MigrationInterface, QueryRunner } from 'typeorm';

export class tagsManagement1626793126211 implements MigrationInterface {
  name = 'tagsManagement1626793126211';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "tag_type_enum" AS ENUM('course')`);
    await queryRunner.query(
      `CREATE TABLE "tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "name" character varying(255) NOT NULL, "type" "tag_type_enum" NOT NULL DEFAULT 'course', CONSTRAINT "tag_unique" UNIQUE ("name", "type", "isActive"), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tag"`);
    await queryRunner.query(`DROP TYPE "tag_type_enum"`);
  }
}
