import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateSystemAnnouncementEntity1649695520893
  implements MigrationInterface
{
  name = 'updateSystemAnnouncementEntity1649695520893';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "system_announcement" DROP COLUMN "endDateTime"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_announcement" DROP COLUMN "startDateTime"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_announcement" ADD "startDate" date NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_announcement" ADD "endDate" date NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "system_announcement" DROP COLUMN "endDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_announcement" DROP COLUMN "startDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_announcement" ADD "startDateTime" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_announcement" ADD "endDateTime" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
  }
}
