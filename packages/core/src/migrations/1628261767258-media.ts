import { MigrationInterface, QueryRunner } from 'typeorm';

export class media1628261767258 implements MigrationInterface {
  name = 'media1628261767258';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "jwMediaId" character varying NOT NULL, "title" character varying NOT NULL, "description" text, "duration" double precision NOT NULL, "filename" character varying NOT NULL, "bytes" integer NOT NULL, "mime" character varying NOT NULL, "uploaderId" uuid, CONSTRAINT "UQ_22b2a037c51d39a72f26fe1fb58" UNIQUE ("jwMediaId"), CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" ADD CONSTRAINT "FK_1f86c243a422b51f191c282acc7" FOREIGN KEY ("uploaderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "media" DROP CONSTRAINT "FK_1f86c243a422b51f191c282acc7"`,
    );
    await queryRunner.query(`DROP TABLE "media"`);
  }
}
