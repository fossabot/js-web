import { MigrationInterface, QueryRunner } from 'typeorm';

export class courseRule1629833495326 implements MigrationInterface {
  name = 'courseRule1629833495326';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "course_rule_item_type_enum" AS ENUM('required')`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_rule_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "type" "course_rule_item_type_enum" NOT NULL DEFAULT 'required', "courseRuleId" uuid NOT NULL, "appliedForId" uuid NOT NULL, "appliedById" uuid NOT NULL, CONSTRAINT "PK_ea87b79d2b6d59de06fbb1719dd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_rule" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "name" character varying(80) NOT NULL, "createdById" uuid NOT NULL, "lastModifiedById" uuid NOT NULL, CONSTRAINT "PK_c0d38cce6328726c626f58ddf3d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_rule_item" ADD CONSTRAINT "FK_eb7fe8c24c19be330f974e69767" FOREIGN KEY ("courseRuleId") REFERENCES "course_rule"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_rule_item" ADD CONSTRAINT "FK_67f8d1a81e74462c05eb6a84a33" FOREIGN KEY ("appliedForId") REFERENCES "course_outline"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_rule_item" ADD CONSTRAINT "FK_268476ce689c0e56ce0d57ca931" FOREIGN KEY ("appliedById") REFERENCES "course_outline"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_rule" ADD CONSTRAINT "FK_eea01bd3911981b81aa5f1e56d5" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_rule" ADD CONSTRAINT "FK_8dcb92ab16f3281703b5079275e" FOREIGN KEY ("lastModifiedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_rule" DROP CONSTRAINT "FK_8dcb92ab16f3281703b5079275e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_rule" DROP CONSTRAINT "FK_eea01bd3911981b81aa5f1e56d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_rule_item" DROP CONSTRAINT "FK_268476ce689c0e56ce0d57ca931"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_rule_item" DROP CONSTRAINT "FK_67f8d1a81e74462c05eb6a84a33"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_rule_item" DROP CONSTRAINT "FK_eb7fe8c24c19be330f974e69767"`,
    );
    await queryRunner.query(`DROP TABLE "course_rule"`);
    await queryRunner.query(`DROP TABLE "course_rule_item"`);
    await queryRunner.query(`DROP TYPE "course_rule_item_type_enum"`);
  }
}
