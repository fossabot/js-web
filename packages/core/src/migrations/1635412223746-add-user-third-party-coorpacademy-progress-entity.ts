import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserThirdPartyCoorpacademyProgressEntity1635412223746
  implements MigrationInterface
{
  name = 'addUserThirdPartyCoorpacademyProgressEntity1635412223746';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_third_party_coorpacademy_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "#Username" text NOT NULL, "Common Name" text, "Engine" text, "Online course ID" text NOT NULL, "Course Name" text, "Course Level" text, "Registration Date" text, "Completion Date" text, "Status" text NOT NULL, "Completed SCOs%" text NOT NULL, "Time in Training (in min)" text, "Stars earned" text, "Live(s) remaining" text, "Remaining Extra Life" text, "Discipline ref" text, CONSTRAINT "PK_e7100c75e57841802d57c3a1a66" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE "user_third_party_coorpacademy_progress"`,
    );
  }
}
