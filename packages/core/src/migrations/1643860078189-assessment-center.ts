import { MigrationInterface, QueryRunner } from 'typeorm';

export class assessmentCenter1643860078189 implements MigrationInterface {
  name = 'assessmentCenter1643860078189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "external_assessment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "externalId" character varying NOT NULL, "status" character varying NOT NULL, "assessmentUrl" character varying NOT NULL, "reportUrl" text, "vendor" text, "courseOutlineId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "course_assessment_unique" UNIQUE ("courseOutlineId", "userId"), CONSTRAINT "PK_f384def7e530f7be4bc6c664abc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "external_assessment" ADD CONSTRAINT "FK_f52740a308c1199523a7fe2655f" FOREIGN KEY ("courseOutlineId") REFERENCES "course_outline"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "external_assessment" ADD CONSTRAINT "FK_d106afac065b6093e9fd6a58f00" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "external_assessment" DROP CONSTRAINT "FK_d106afac065b6093e9fd6a58f00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "external_assessment" DROP CONSTRAINT "FK_f52740a308c1199523a7fe2655f"`,
    );
    await queryRunner.query(`DROP TABLE "external_assessment"`);
  }
}
