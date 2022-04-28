import { MigrationInterface, QueryRunner } from 'typeorm';

export class courseAllLevel1629242520613 implements MigrationInterface {
  name = 'courseAllLevel1629242520613';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "FK_372c80728a16e5935264fc8d378"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "FK_6a39309eefdc4aff421b7555de2"`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_session_instructor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "courseSessionId" uuid NOT NULL, "instructorId" uuid NOT NULL, CONSTRAINT "course_session_instructor_unique" UNIQUE ("courseSessionId", "instructorId"), CONSTRAINT "PK_f713d48769797bbcb188a53d93d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "seats" integer NOT NULL, "webinarTool" character varying(200), "facilitatorUrl" character varying(200), "participantUrl" character varying(200), "startDateTime" TIMESTAMP WITH TIME ZONE NOT NULL, "endDateTime" TIMESTAMP WITH TIME ZONE NOT NULL, "courseOutlineId" uuid NOT NULL, CONSTRAINT "PK_12288a725cc3c3fba4e600a0ef6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "course_category_key_enum" AS ENUM('learningEvent', 'onlineLearning', 'assessment', 'material')`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "name" character varying NOT NULL, "key" "course_category_key_enum" NOT NULL, "description" character varying(500), CONSTRAINT "UQ_53b3756334350f08d94bc5136a0" UNIQUE ("name"), CONSTRAINT "UQ_f03de7715672e95c6a518ff0a23" UNIQUE ("key"), CONSTRAINT "PK_2f133fd8aa7a4d85ff7cd6f7c98" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "course_sub_category_key_enum" AS ENUM('faceToFace', 'virtual', 'scorm', 'xAPI', 'video', 'audio', 'link', 'assessment', 'quiz', 'survey', 'document', 'picture')`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_sub_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "name" character varying NOT NULL, "key" "course_sub_category_key_enum" NOT NULL, "description" character varying(500), "courseCategoryId" uuid NOT NULL, CONSTRAINT "UQ_39b36d2d7d2d31ab83299140f57" UNIQUE ("key"), CONSTRAINT "PK_d71b559099f77689eef1b0c2345" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_outline_media_play_list" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "courseOutlineId" uuid NOT NULL, "mediaId" uuid NOT NULL, "sequence" integer NOT NULL, CONSTRAINT "PK_6567744d1412e31087a8956c3ec" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "learning_content_file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "mime" character varying NOT NULL DEFAULT 'application/octet-stream', "filename" character varying NOT NULL, "key" character varying NOT NULL, "bytes" integer NOT NULL, "hash" character varying NOT NULL, "language" text, "uploaderId" uuid, CONSTRAINT "PK_44e37cdf57fb3c7e5a45c400f78" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "course_outline_durationinterval_enum" AS ENUM('second', 'minute', 'hour', 'day', 'week', 'month', 'year')`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_outline" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "title" character varying(80), "part" integer NOT NULL, "durationValue" integer NOT NULL, "durationInterval" "course_outline_durationinterval_enum" NOT NULL, "description" text, "providerName" character varying(200), "thirdPartyPlatformUrl" character varying(200), "courseId" uuid NOT NULL, "categoryId" uuid NOT NULL, "learningWayId" uuid NOT NULL, "productItemMasterId" uuid NOT NULL, "organizationProviderId" uuid, "learningContentFileId" uuid, CONSTRAINT "PK_0eff78a10e63c7cefb899dd3b42" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP COLUMN "durationInSecond"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "UQ_372c80728a16e5935264fc8d378"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP COLUMN "productMasterId"`,
    );
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "courseType"`);
    await queryRunner.query(`DROP TYPE "public"."course_coursetype_enum"`);
    await queryRunner.query(
      `ALTER TABLE "course" DROP COLUMN "organizationProviderId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP COLUMN "thirdPartyPlatformUrl"`,
    );
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "toc"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "providerName"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "courseTargets"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "syllabus"`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD "durationValue" integer NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "course_durationinterval_enum" AS ENUM('second', 'minute', 'hour', 'day', 'week', 'month', 'year')`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "durationInterval" "course_durationinterval_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "learningObjective" text`,
    );
    await queryRunner.query(`ALTER TABLE "course" ADD "courseTarget" text`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD "categoryId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_session_instructor" ADD CONSTRAINT "FK_595375b7a97f3d453ef1df0d7db" FOREIGN KEY ("courseSessionId") REFERENCES "course_session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_session_instructor" ADD CONSTRAINT "FK_79daa14aa6b5ba5c17fac881abe" FOREIGN KEY ("instructorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_session" ADD CONSTRAINT "FK_3c14ffcea719c93c47e6ad83888" FOREIGN KEY ("courseOutlineId") REFERENCES "course_outline"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_sub_category" ADD CONSTRAINT "FK_1946b825ad2e43ea626dfc9b35f" FOREIGN KEY ("courseCategoryId") REFERENCES "course_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline_media_play_list" ADD CONSTRAINT "FK_66ec177708efaed473eecd403ae" FOREIGN KEY ("courseOutlineId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline_media_play_list" ADD CONSTRAINT "FK_d8f15edab0657f6fa92ad13ed8a" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_content_file" ADD CONSTRAINT "FK_7692411e93f260f3410117f91b1" FOREIGN KEY ("uploaderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD CONSTRAINT "FK_b9b3e04ed52c5cc617c9d46f22e" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD CONSTRAINT "FK_e944c83c97d7581f70f46fc8736" FOREIGN KEY ("categoryId") REFERENCES "course_sub_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD CONSTRAINT "FK_24241554d9e2f0b239d54c84133" FOREIGN KEY ("learningWayId") REFERENCES "learning_way"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD CONSTRAINT "FK_5fec35bb3d435ee53c5c4a94b68" FOREIGN KEY ("productItemMasterId") REFERENCES "product_item_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD CONSTRAINT "FK_86c5ed276af6205d19aa3ba3a23" FOREIGN KEY ("organizationProviderId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD CONSTRAINT "FK_313854392592806f0da77ef622d" FOREIGN KEY ("learningContentFileId") REFERENCES "learning_content_file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "FK_c6c48d73b3b32e47e9cc1cfc4c4" FOREIGN KEY ("categoryId") REFERENCES "course_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "FK_c6c48d73b3b32e47e9cc1cfc4c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP CONSTRAINT "FK_313854392592806f0da77ef622d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP CONSTRAINT "FK_86c5ed276af6205d19aa3ba3a23"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP CONSTRAINT "FK_5fec35bb3d435ee53c5c4a94b68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP CONSTRAINT "FK_24241554d9e2f0b239d54c84133"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP CONSTRAINT "FK_e944c83c97d7581f70f46fc8736"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP CONSTRAINT "FK_b9b3e04ed52c5cc617c9d46f22e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_content_file" DROP CONSTRAINT "FK_7692411e93f260f3410117f91b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline_media_play_list" DROP CONSTRAINT "FK_d8f15edab0657f6fa92ad13ed8a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline_media_play_list" DROP CONSTRAINT "FK_66ec177708efaed473eecd403ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_sub_category" DROP CONSTRAINT "FK_1946b825ad2e43ea626dfc9b35f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_session" DROP CONSTRAINT "FK_3c14ffcea719c93c47e6ad83888"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_session_instructor" DROP CONSTRAINT "FK_79daa14aa6b5ba5c17fac881abe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_session_instructor" DROP CONSTRAINT "FK_595375b7a97f3d453ef1df0d7db"`,
    );
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "categoryId"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "courseTarget"`);
    await queryRunner.query(
      `ALTER TABLE "course" DROP COLUMN "learningObjective"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP COLUMN "durationInterval"`,
    );
    await queryRunner.query(`DROP TYPE "course_durationinterval_enum"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "durationValue"`);
    await queryRunner.query(`ALTER TABLE "course" ADD "syllabus" text`);
    await queryRunner.query(`ALTER TABLE "course" ADD "courseTargets" text`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD "providerName" character varying(200)`,
    );
    await queryRunner.query(`ALTER TABLE "course" ADD "toc" text`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD "thirdPartyPlatformUrl" character varying(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "organizationProviderId" uuid`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."course_coursetype_enum" AS ENUM('online', 'virtual', 'classroom', 'scorm')`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "courseType" "course_coursetype_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "productMasterId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "UQ_372c80728a16e5935264fc8d378" UNIQUE ("productMasterId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "durationInSecond" integer NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "course_outline"`);
    await queryRunner.query(`DROP TYPE "course_outline_durationinterval_enum"`);
    await queryRunner.query(`DROP TABLE "learning_content_file"`);
    await queryRunner.query(`DROP TABLE "course_outline_media_play_list"`);
    await queryRunner.query(`DROP TABLE "course_sub_category"`);
    await queryRunner.query(`DROP TYPE "course_sub_category_key_enum"`);
    await queryRunner.query(`DROP TABLE "course_category"`);
    await queryRunner.query(`DROP TYPE "course_category_key_enum"`);
    await queryRunner.query(`DROP TABLE "course_session"`);
    await queryRunner.query(`DROP TABLE "course_session_instructor"`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "FK_6a39309eefdc4aff421b7555de2" FOREIGN KEY ("organizationProviderId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "FK_372c80728a16e5935264fc8d378" FOREIGN KEY ("productMasterId") REFERENCES "product_item_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
