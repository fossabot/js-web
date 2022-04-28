import { MigrationInterface, QueryRunner } from 'typeorm';

export class sessionBooking1634284640708 implements MigrationInterface {
  name = 'sessionBooking1634284640708';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "course_session_booking" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "studentId" uuid NOT NULL, "courseSessionId" uuid NOT NULL, CONSTRAINT "PK_c1c4448876f19b16fa69fbe9021" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "profileImageKey" character varying(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_session_booking" ADD CONSTRAINT "FK_383f2fe85aad295c5a06fbf46ad" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_session_booking" ADD CONSTRAINT "FK_6cf12d4992ba96f86b31ad85b7a" FOREIGN KEY ("courseSessionId") REFERENCES "course_session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_session_booking" DROP CONSTRAINT "FK_6cf12d4992ba96f86b31ad85b7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_session_booking" DROP CONSTRAINT "FK_383f2fe85aad295c5a06fbf46ad"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profileImageKey"`);
    await queryRunner.query(`DROP TABLE "course_session_booking"`);
  }
}
