import { MigrationInterface, QueryRunner } from 'typeorm';

export class userUploadStatus1626890890047 implements MigrationInterface {
  name = 'userUploadStatus1626890890047';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_upload_history_status_enum" AS ENUM('pending', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_upload_history" ADD "status" "user_upload_history_status_enum" NOT NULL DEFAULT 'pending'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_upload_history" DROP COLUMN "status"`,
    );
    await queryRunner.query(`DROP TYPE "user_upload_history_status_enum"`);
  }
}
