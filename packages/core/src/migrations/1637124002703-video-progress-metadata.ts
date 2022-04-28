import { MigrationInterface, QueryRunner } from 'typeorm';

export class videoProgressMetadata1637124002703 implements MigrationInterface {
  name = 'videoProgressMetadata1637124002703';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_video_course_outline_metadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "lastDuration" double precision NOT NULL, "videoProgress" jsonb NOT NULL, "lastVideoId" uuid, "userCourseOutlineProgressId" uuid NOT NULL, CONSTRAINT "PK_c3b43a38796cc9a31daddbdfab9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_video_course_outline_metadata" ADD CONSTRAINT "FK_6fb09d0cd6bcd4172ca53039ede" FOREIGN KEY ("lastVideoId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_video_course_outline_metadata" ADD CONSTRAINT "FK_28cb3dfff2634efa22dda828cd6" FOREIGN KEY ("userCourseOutlineProgressId") REFERENCES "user_course_outline_progress"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_video_course_outline_metadata" DROP CONSTRAINT "FK_28cb3dfff2634efa22dda828cd6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_video_course_outline_metadata" DROP CONSTRAINT "FK_6fb09d0cd6bcd4172ca53039ede"`,
    );
    await queryRunner.query(`DROP TABLE "user_video_course_outline_metadata"`);
  }
}
