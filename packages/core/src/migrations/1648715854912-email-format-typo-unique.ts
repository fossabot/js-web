import { MigrationInterface, QueryRunner } from 'typeorm';

export class emailFormatTypoUnique1648715854912 implements MigrationInterface {
  name = 'emailFormatTypoUnique1648715854912';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "email_format" DROP COLUMN "copyRightsText"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_format" DROP COLUMN "footerImagekey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_format" ADD "footerImageKey" character varying(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_format" ADD "copyrightText" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_format" DROP CONSTRAINT "email_format_unique"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "email_format" ADD CONSTRAINT "email_format_unique" UNIQUE ("formatName")`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_format" DROP COLUMN "copyrightText"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_format" DROP COLUMN "footerImageKey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_format" ADD "footerImagekey" character varying(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_format" ADD "copyRightsText" text`,
    );
  }
}
