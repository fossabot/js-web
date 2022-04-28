import { MigrationInterface, QueryRunner } from 'typeorm';
import { SYSTEM_ROLES } from '../utils/constants';

export class updateSystemRoleIsSystemDefined1650858464210
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      `
      UPDATE "role"
      SET "isSystemDefined" = 't'
      WHERE "role"."name" IN (
        ${Object.values(SYSTEM_ROLES)
          .map((role) => `'${role}'`)
          .join(', ')}
      );`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
