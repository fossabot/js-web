import { MigrationInterface, QueryRunner } from 'typeorm';

export class courseLanguage1633606113777 implements MigrationInterface {
  name = 'courseLanguage1633606113777';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "description"`,
    );
    await queryRunner.query(`ALTER TABLE "course_outline" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "courseTarget"`);
    await queryRunner.query(
      `ALTER TABLE "course" DROP COLUMN "learningObjective"`,
    );
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "tagLine"`);
    await queryRunner.query(`ALTER TABLE "course_outline" ADD "titleId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "descriptionId" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "course" ADD "titleId" uuid`);
    await queryRunner.query(`ALTER TABLE "course" ADD "tagLineId" uuid`);
    await queryRunner.query(`ALTER TABLE "course" ADD "descriptionId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD "learningObjectiveId" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "course" ADD "courseTargetId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "language" ALTER COLUMN "nameTh" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD CONSTRAINT "FK_83225cb10b31652e569682ca143" FOREIGN KEY ("titleId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD CONSTRAINT "FK_54335f769c4e36e5dcfabae1b12" FOREIGN KEY ("descriptionId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "FK_4878b1eed29380f677d21261f29" FOREIGN KEY ("titleId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "FK_bf15f87a20801146fd3dd83e1ef" FOREIGN KEY ("tagLineId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "FK_903474905007e1a59388637a8f5" FOREIGN KEY ("descriptionId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "FK_32c833aeecde0aa22ed8a08b813" FOREIGN KEY ("learningObjectiveId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "FK_6a8752b2ff919b5de7da6d7ec26" FOREIGN KEY ("courseTargetId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "FK_6a8752b2ff919b5de7da6d7ec26"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "FK_32c833aeecde0aa22ed8a08b813"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "FK_903474905007e1a59388637a8f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "FK_bf15f87a20801146fd3dd83e1ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "FK_4878b1eed29380f677d21261f29"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP CONSTRAINT "FK_54335f769c4e36e5dcfabae1b12"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP CONSTRAINT "FK_83225cb10b31652e569682ca143"`,
    );
    await queryRunner.query(
      `ALTER TABLE "language" ALTER COLUMN "nameTh" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP COLUMN "courseTargetId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP COLUMN "learningObjectiveId"`,
    );
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "descriptionId"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "tagLineId"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "titleId"`);
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "descriptionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" DROP COLUMN "titleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "tagLine" character varying(200)`,
    );
    await queryRunner.query(`ALTER TABLE "course" ADD "description" text`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD "title" character varying(80)`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "learningObjective" text`,
    );
    await queryRunner.query(`ALTER TABLE "course" ADD "courseTarget" text`);
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "title" character varying(80)`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_outline" ADD "description" text`,
    );
  }
}
