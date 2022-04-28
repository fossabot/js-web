import { MigrationInterface, QueryRunner } from 'typeorm';

export class userMigrationCli1631118978213 implements MigrationInterface {
  name = 'userMigrationCli1631118978213';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "group" ADD "instancyId" integer`);
    await queryRunner.query(
      `ALTER TABLE "group" ADD CONSTRAINT "UQ_cce845739b11c4bf4ab3ba4c4cc" UNIQUE ("instancyId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "group" ADD "isInstancy" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isInstancy" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_7b4e17a669299579dfa55a3fc3" ON "user_role" ("userId", "roleId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_16152fced7dcc54196c5605ce8" ON "group_user" ("userId", "groupId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_16152fced7dcc54196c5605ce8"`);
    await queryRunner.query(`DROP INDEX "IDX_7b4e17a669299579dfa55a3fc3"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isInstancy"`);
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "isInstancy"`);
    await queryRunner.query(
      `ALTER TABLE "group" DROP CONSTRAINT "UQ_cce845739b11c4bf4ab3ba4c4cc"`,
    );
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "instancyId"`);
  }
}
