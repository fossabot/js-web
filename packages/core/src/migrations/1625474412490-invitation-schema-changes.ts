import { MigrationInterface, QueryRunner } from 'typeorm';

export class invitationSchemaChanges1625474412490
  implements MigrationInterface
{
  name = 'invitationSchemaChanges1625474412490';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "invitation" ADD "userId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "invitation" ADD CONSTRAINT "FK_05191060fae5b5485327709be7f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invitation" DROP CONSTRAINT "FK_05191060fae5b5485327709be7f"`,
    );
    await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "invitation" ADD "userId" character varying`,
    );
  }
}
