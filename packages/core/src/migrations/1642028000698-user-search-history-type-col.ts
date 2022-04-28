import { MigrationInterface, QueryRunner } from 'typeorm';

export class userSearchHistoryTypeCol1642028000698
  implements MigrationInterface
{
  name = 'userSearchHistoryTypeCol1642028000698';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_search_history_type_enum" AS ENUM('course', 'learningTrack', 'instructor')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_search_history" ADD "type" "user_search_history_type_enum" NOT NULL DEFAULT 'course'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_search_history" DROP COLUMN "type"`,
    );
    await queryRunner.query(`DROP TYPE "user_search_history_type_enum"`);
  }
}
