import { MigrationInterface, QueryRunner } from 'typeorm';

export class userLastLoginDate1649143930089 implements MigrationInterface {
  name = 'userLastLoginDate1649143930089';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "lastLoginDate" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastLoginDate"`);
  }
}
