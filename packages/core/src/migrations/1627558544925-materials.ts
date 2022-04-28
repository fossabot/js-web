import { MigrationInterface, QueryRunner } from 'typeorm';

export class materials1627558544925 implements MigrationInterface {
  name = 'materials1627558544925';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "material" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "type" character varying NOT NULL, "displayName" character varying NOT NULL, "language" text, "mime" character varying DEFAULT 'application/octet-stream', "key" character varying, "bytes" integer, "hash" character varying, "url" character varying, "uploaderId" uuid, CONSTRAINT "PK_0343d0d577f3effc2054cbaca7f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_69c902e6c6e44e099a721936b8" ON "material" ("type") `,
    );
    await queryRunner.query(
      `ALTER TABLE "material" ADD CONSTRAINT "FK_d667db490e25640fc53e96952e9" FOREIGN KEY ("uploaderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "material" DROP CONSTRAINT "FK_d667db490e25640fc53e96952e9"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_69c902e6c6e44e099a721936b8"`);
    await queryRunner.query(`DROP TABLE "material"`);
  }
}
