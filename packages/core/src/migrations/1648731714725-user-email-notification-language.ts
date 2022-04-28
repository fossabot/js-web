import { MigrationInterface, QueryRunner } from 'typeorm';

export class userEmailNotificationLanguage1648731714725
  implements MigrationInterface
{
  name = 'userEmailNotificationLanguage1648731714725';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_emailnotificationlanguage_enum" AS ENUM('en', 'th')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "emailNotificationLanguage" "public"."user_emailnotificationlanguage_enum" NOT NULL DEFAULT 'en'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "emailNotificationLanguage"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_emailnotificationlanguage_enum"`,
    );
  }
}
