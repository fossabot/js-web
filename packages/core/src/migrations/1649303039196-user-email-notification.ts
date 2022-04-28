import { MigrationInterface, QueryRunner } from 'typeorm';

export class userEmailNotification1649303039196 implements MigrationInterface {
  name = 'userEmailNotification1649303039196';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_email_notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "subject" character varying NOT NULL, "html" text NOT NULL, "text" text NOT NULL, "category" character varying NOT NULL, "from" character varying NOT NULL, "awsMessageId" character varying NOT NULL, CONSTRAINT "PK_ba3b5906dbcffd9253ac296a12c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_email_notification" ADD CONSTRAINT "FK_e3051d4432fa62aa6013963643f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_email_notification" DROP CONSTRAINT "FK_e3051d4432fa62aa6013963643f"`,
    );
    await queryRunner.query(`DROP TABLE "user_email_notification"`);
  }
}
