import { MigrationInterface, QueryRunner } from 'typeorm';

export class playlist1629280321400 implements MigrationInterface {
  name = 'playlist1629280321400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "playlist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "jwPlaylistId" character varying NOT NULL, "title" character varying NOT NULL, "description" text, "authorId" uuid, CONSTRAINT "PK_538c2893e2024fabc7ae65ad142" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "media_playlist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "playlistId" uuid, "mediaId" uuid, CONSTRAINT "PK_15fb7e804860efc4a4d39f8b2a2" PRIMARY KEY ("id"), "sequence" integer NOT NULL)`,
    );
    await queryRunner.query(
      `ALTER TABLE "playlist" ADD CONSTRAINT "FK_40608736aa7f9abf5171b529510" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_playlist" ADD CONSTRAINT "FK_3b8dfb4c0fc8fc5e9859c6560f2" FOREIGN KEY ("playlistId") REFERENCES "playlist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_playlist" ADD CONSTRAINT "FK_918baff308b9ab83fe10dcb1924" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "media_playlist" DROP CONSTRAINT "FK_918baff308b9ab83fe10dcb1924"`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_playlist" DROP CONSTRAINT "FK_3b8dfb4c0fc8fc5e9859c6560f2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "playlist" DROP CONSTRAINT "FK_40608736aa7f9abf5171b529510"`,
    );
    await queryRunner.query(`DROP TABLE "media_playlist"`);
    await queryRunner.query(`DROP TABLE "playlist"`);
  }
}
