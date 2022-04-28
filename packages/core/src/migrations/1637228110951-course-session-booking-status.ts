import { MigrationInterface, QueryRunner } from 'typeorm';

export class courseSessionBookingStatus1637228110951
  implements MigrationInterface
{
  name = 'courseSessionBookingStatus1637228110951';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_session_booking" ADD "status" character varying NOT NULL DEFAULT 'NO_MARK'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_session_booking" DROP COLUMN "status"`,
    );
  }
}
