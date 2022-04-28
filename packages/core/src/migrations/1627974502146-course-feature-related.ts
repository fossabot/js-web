import { MigrationInterface, QueryRunner } from 'typeorm';

export class courseFeatureRelated1627974502146 implements MigrationInterface {
  name = 'courseFeatureRelated1627974502146';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "course_coursetype_enum" AS ENUM('online', 'virtual', 'classroom', 'scorm')`,
    );
    await queryRunner.query(
      `CREATE TYPE "course_status_enum" AS ENUM('draft', 'published')`,
    );
    await queryRunner.query(
      `CREATE TYPE "course_availablelanguage_enum" AS ENUM('th', 'en', 'all')`,
    );
    await queryRunner.query(
      `CREATE TABLE "course" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "title" character varying(80) NOT NULL, "tagLine" character varying(200), "durationInSecond" integer NOT NULL, "courseType" "course_coursetype_enum" NOT NULL, "availableLanguage" "course_availablelanguage_enum" NOT NULL, "providerName" character varying(200), "thirdPartyPlatformUrl" character varying(200), "description" text, "syllabus" text, "toc" text, "courseTargets" text, "isPublic" boolean NOT NULL DEFAULT false, "status" "course_status_enum" NOT NULL, "organizationProviderId" uuid, CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_material" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "courseId" uuid NOT NULL, "materialId" uuid NOT NULL, CONSTRAINT "course_material_unique" UNIQUE ("materialId", "courseId"), CONSTRAINT "PK_f613a59407b9d91a2daccc0a636" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "courseId" uuid NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "course_tag_unique" UNIQUE ("tagId", "courseId"), CONSTRAINT "PK_6c6a0ad4b5f67db91353e5b2ae1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_topic" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "courseId" uuid NOT NULL, "topicId" uuid NOT NULL, CONSTRAINT "course_topic_unique" UNIQUE ("topicId", "courseId"), CONSTRAINT "PK_bb9496c0f072f7031551c798217" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "FK_6a39309eefdc4aff421b7555de2" FOREIGN KEY ("organizationProviderId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_material" ADD CONSTRAINT "FK_3b0e76dd3ad438a7efd302d64c0" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_material" ADD CONSTRAINT "FK_c53a40dbd9206b46021145b79d0" FOREIGN KEY ("materialId") REFERENCES "material"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_tag" ADD CONSTRAINT "FK_f3ad3d4417c248a437d1745883f" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_tag" ADD CONSTRAINT "FK_063751f655f43b428be845fa7d3" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_topic" ADD CONSTRAINT "FK_ee208275810eb91144a81c593c7" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_topic" ADD CONSTRAINT "FK_7dc250afef14184a4ce59b1e246" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_topic" DROP CONSTRAINT "FK_7dc250afef14184a4ce59b1e246"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_topic" DROP CONSTRAINT "FK_ee208275810eb91144a81c593c7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_tag" DROP CONSTRAINT "FK_063751f655f43b428be845fa7d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_tag" DROP CONSTRAINT "FK_f3ad3d4417c248a437d1745883f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_material" DROP CONSTRAINT "FK_c53a40dbd9206b46021145b79d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_material" DROP CONSTRAINT "FK_3b0e76dd3ad438a7efd302d64c0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "FK_6a39309eefdc4aff421b7555de2"`,
    );
    await queryRunner.query(`DROP TABLE "course_topic"`);
    await queryRunner.query(`DROP TABLE "course_tag"`);
    await queryRunner.query(`DROP TABLE "course_material"`);
    await queryRunner.query(`DROP TABLE "course"`);
    await queryRunner.query(`DROP TYPE "course_coursetype_enum"`);
    await queryRunner.query(`DROP TYPE "course_status_enum"`);
    await queryRunner.query(`DROP TYPE "course_availablelanguage_enum"`);
  }
}
