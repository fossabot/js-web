import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFileImportHistoryEntity1635497926273
  implements MigrationInterface
{
  name = 'addFileImportHistoryEntity1635497926273';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "file_import_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "key" text NOT NULL, "note" text, "source" text NOT NULL, CONSTRAINT "PK_c486e0ed54a1262f97e6d52a72a" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "file_import_history"`);
  }
}
