import { MigrationInterface, QueryRunner } from 'typeorm';

export class courseOutlineMediaPlaylistFixMedia1629455605674
  implements MigrationInterface
{
  name = 'courseOutlineMediaPlaylistFixMedia1629455605674';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_outline_media_play_list" DROP CONSTRAINT "FK_66ec177708efaed473eecd403ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline_media_play_list" ADD CONSTRAINT "course_outline_media_unique" UNIQUE ("courseOutlineId", "mediaId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline_media_play_list" ADD CONSTRAINT "FK_66ec177708efaed473eecd403ae" FOREIGN KEY ("courseOutlineId") REFERENCES "course_outline"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_outline_media_play_list" DROP CONSTRAINT "FK_66ec177708efaed473eecd403ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline_media_play_list" DROP CONSTRAINT "course_outline_media_unique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline_media_play_list" ADD CONSTRAINT "FK_66ec177708efaed473eecd403ae" FOREIGN KEY ("courseOutlineId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
