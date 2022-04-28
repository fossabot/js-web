import { MigrationInterface, QueryRunner } from 'typeorm';

export class learningTrack1635888883735 implements MigrationInterface {
  name = 'learningTrack1635888883735';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "learning_track_tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "learningTrackId" uuid NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "learning_track_tag_unique" UNIQUE ("tagId", "learningTrackId"), CONSTRAINT "PK_4dfe2bdc3d629b4bf2a0e93ee6a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "learning_track_topic" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "learningTrackId" uuid NOT NULL, "topicId" uuid NOT NULL, CONSTRAINT "learning_track_topic_unique" UNIQUE ("topicId", "learningTrackId"), CONSTRAINT "PK_b2e5f0ae45a002b3e12ba6ae3a9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "learning_track_section_course" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "courseId" uuid NOT NULL, "learningTrackSectionId" uuid NOT NULL, CONSTRAINT "learning_track_section_course_unique" UNIQUE ("learningTrackSectionId", "courseId"), CONSTRAINT "PK_fb1ff8e46fadbb771f3e9693431" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "learning_track_section" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "part" integer NOT NULL, "learningTrackId" uuid NOT NULL, "titleId" uuid, CONSTRAINT "PK_ca5b8ff429ae7cc17019371abaa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "learning_track_material" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "learningTrackId" uuid NOT NULL, "materialId" uuid NOT NULL, CONSTRAINT "learning_track_material_unique" UNIQUE ("materialId", "learningTrackId"), CONSTRAINT "PK_39e9eb74d2330f5dee960bdf422" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_enrolled_learning_track" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "userId" uuid NOT NULL, "learningTrackId" uuid NOT NULL, CONSTRAINT "user_enrolled_learning_track_unique" UNIQUE ("userId", "learningTrackId"), CONSTRAINT "PK_2d31134e738b061473594c14eca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "learning_track_status_enum" AS ENUM('draft', 'published')`,
    );
    await queryRunner.query(
      `CREATE TABLE "learning_track" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "durationMinutes" integer NOT NULL DEFAULT '0', "durationHours" integer NOT NULL DEFAULT '0', "durationDays" integer NOT NULL DEFAULT '0', "durationWeeks" integer NOT NULL DEFAULT '0', "durationMonths" integer NOT NULL DEFAULT '0', "isPublic" boolean NOT NULL DEFAULT false, "status" "learning_track_status_enum" NOT NULL, "isFeatured" boolean NOT NULL DEFAULT false, "imageKey" character varying(200), "titleId" uuid, "tagLineId" uuid, "descriptionId" uuid, "learningObjectiveId" uuid, "learningTrackTargetId" uuid, "categoryId" uuid NOT NULL, CONSTRAINT "PK_89829a6345b3cb5d45b3d8b0999" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_tag" ADD CONSTRAINT "FK_4d457c08f8946679a8d0abc25c3" FOREIGN KEY ("learningTrackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_tag" ADD CONSTRAINT "FK_2fa078b34d2e52afa21d76fd798" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_topic" ADD CONSTRAINT "FK_b80fa5837120773442ac968b2ef" FOREIGN KEY ("learningTrackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_topic" ADD CONSTRAINT "FK_34491b1d554f9efed7a1e2ae17a" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_section_course" ADD CONSTRAINT "FK_485d38eb5dce111951bded4a92b" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_section_course" ADD CONSTRAINT "FK_8539a31eebb14bc68dad7c2f5a9" FOREIGN KEY ("learningTrackSectionId") REFERENCES "learning_track_section"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_section" ADD CONSTRAINT "FK_235d9e4504d1cba3595f61a2125" FOREIGN KEY ("titleId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_section" ADD CONSTRAINT "FK_634f327e7aaa79cef821a016805" FOREIGN KEY ("learningTrackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_material" ADD CONSTRAINT "FK_ae5debcee3bb069b453ddc9164e" FOREIGN KEY ("learningTrackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_material" ADD CONSTRAINT "FK_f8c12cdc23da78117fa3daef685" FOREIGN KEY ("materialId") REFERENCES "material"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_learning_track" ADD CONSTRAINT "FK_7c9b35e4ee71d3a15b57d534c79" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_learning_track" ADD CONSTRAINT "FK_ca9d8bf84e7e5b21d5866265f86" FOREIGN KEY ("learningTrackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track" ADD CONSTRAINT "FK_2d0c4b4ec07775f8e4534700978" FOREIGN KEY ("titleId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track" ADD CONSTRAINT "FK_eef78fe8d8e2ca53f25c5927b70" FOREIGN KEY ("tagLineId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track" ADD CONSTRAINT "FK_a40b4761bc0a5b7e26bfc37c7c3" FOREIGN KEY ("descriptionId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track" ADD CONSTRAINT "FK_164d611e4b19ad9a680f2bd03b9" FOREIGN KEY ("learningObjectiveId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track" ADD CONSTRAINT "FK_b3c751c1f0bfe4156136f6ce0c2" FOREIGN KEY ("learningTrackTargetId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track" ADD CONSTRAINT "FK_40bbc12894acaccfb731ecdcc70" FOREIGN KEY ("categoryId") REFERENCES "course_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "learning_track" DROP CONSTRAINT "FK_40bbc12894acaccfb731ecdcc70"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track" DROP CONSTRAINT "FK_b3c751c1f0bfe4156136f6ce0c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track" DROP CONSTRAINT "FK_164d611e4b19ad9a680f2bd03b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track" DROP CONSTRAINT "FK_a40b4761bc0a5b7e26bfc37c7c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track" DROP CONSTRAINT "FK_eef78fe8d8e2ca53f25c5927b70"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track" DROP CONSTRAINT "FK_2d0c4b4ec07775f8e4534700978"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_learning_track" DROP CONSTRAINT "FK_ca9d8bf84e7e5b21d5866265f86"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_learning_track" DROP CONSTRAINT "FK_7c9b35e4ee71d3a15b57d534c79"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_material" DROP CONSTRAINT "FK_f8c12cdc23da78117fa3daef685"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_material" DROP CONSTRAINT "FK_ae5debcee3bb069b453ddc9164e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_section" DROP CONSTRAINT "FK_634f327e7aaa79cef821a016805"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_section" DROP CONSTRAINT "FK_235d9e4504d1cba3595f61a2125"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_section_course" DROP CONSTRAINT "FK_8539a31eebb14bc68dad7c2f5a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_section_course" DROP CONSTRAINT "FK_485d38eb5dce111951bded4a92b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_topic" DROP CONSTRAINT "FK_34491b1d554f9efed7a1e2ae17a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_topic" DROP CONSTRAINT "FK_b80fa5837120773442ac968b2ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_tag" DROP CONSTRAINT "FK_2fa078b34d2e52afa21d76fd798"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_tag" DROP CONSTRAINT "FK_4d457c08f8946679a8d0abc25c3"`,
    );
    await queryRunner.query(`DROP TABLE "learning_track"`);
    await queryRunner.query(`DROP TYPE "learning_track_status_enum"`);
    await queryRunner.query(`DROP TABLE "user_enrolled_learning_track"`);
    await queryRunner.query(`DROP TABLE "learning_track_material"`);
    await queryRunner.query(`DROP TABLE "learning_track_section"`);
    await queryRunner.query(`DROP TABLE "learning_track_section_course"`);
    await queryRunner.query(`DROP TABLE "learning_track_topic"`);
    await queryRunner.query(`DROP TABLE "learning_track_tag"`);
  }
}
