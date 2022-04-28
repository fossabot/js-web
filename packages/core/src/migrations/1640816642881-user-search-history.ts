import { MigrationInterface, QueryRunner } from 'typeorm';

export class userSearchHistory1640816642881 implements MigrationInterface {
  name = 'userSearchHistory1640816642881';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_search_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "userId" uuid NOT NULL, "term" character varying NOT NULL, CONSTRAINT "PK_3628fe7607121da05bf51f73119" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_search_history" ADD CONSTRAINT "FK_6aba74f1eecc3a4472fafa9b0b0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_search_history" DROP CONSTRAINT "FK_6aba74f1eecc3a4472fafa9b0b0"`,
    );
    await queryRunner.query(`DROP TABLE "user_search_history"`);
  }
}
