import { MigrationInterface, QueryRunner } from 'typeorm';

export class certificate1635741622052 implements MigrationInterface {
  name = 'certificate1635741622052';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "certificate" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "orientation" character varying NOT NULL, "certType" character varying, "title" character varying NOT NULL, "mime" character varying NOT NULL, "filename" character varying NOT NULL, "key" character varying NOT NULL, "bytes" integer NOT NULL, "hash" character varying NOT NULL, "type" character varying NOT NULL, "uploaderId" uuid, CONSTRAINT "PK_8daddfc65f59e341c2bbc9c9e43" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ccd286bc19b1e29b1238de085c" ON "certificate" ("type") `,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate" ADD CONSTRAINT "FK_0f288096a3e1132fc130675260e" FOREIGN KEY ("uploaderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "certificate" DROP CONSTRAINT "FK_0f288096a3e1132fc130675260e"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_ccd286bc19b1e29b1238de085c"`);
    await queryRunner.query(`DROP TABLE "certificate"`);
  }
}
