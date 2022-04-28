import { MigrationInterface, QueryRunner } from 'typeorm';

export class userDashboardCourseDiscovery1639371641087
  implements MigrationInterface
{
  name = 'userDashboardCourseDiscovery1639371641087';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "course_discovery_type_enum" AS ENUM('highlight', 'popular', 'newRelease')`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_discovery" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "sequence" smallint NOT NULL DEFAULT '0', "type" "course_discovery_type_enum" NOT NULL, "courseId" uuid, CONSTRAINT "PK_301ccc44a38cfcbb3ad31e64294" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_discovery" ADD CONSTRAINT "FK_5452f5c518fcc030a21ccea44ba" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_discovery" DROP CONSTRAINT "FK_5452f5c518fcc030a21ccea44ba"`,
    );
    await queryRunner.query(`DROP TABLE "course_discovery"`);
    await queryRunner.query(`DROP TYPE "course_discovery_type_enum"`);
  }
}
