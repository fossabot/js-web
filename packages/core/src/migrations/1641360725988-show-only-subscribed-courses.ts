import { MigrationInterface, QueryRunner } from 'typeorm';

export class showOnlySubscribedCourses1641360725988
  implements MigrationInterface
{
  name = 'showOnlySubscribedCourses1641360725988';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group" ADD "showOnlySubscribedCourses" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "showOnlySubscribedCourses" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "showOnlySubscribedCourses"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group" DROP COLUMN "showOnlySubscribedCourses"`,
    );
  }
}
