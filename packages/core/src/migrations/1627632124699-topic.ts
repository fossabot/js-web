import { MigrationInterface, QueryRunner } from 'typeorm';

export class topic1627632124699 implements MigrationInterface {
  name = 'topic1627632124699';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "topic" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "name" character varying(255) NOT NULL, "parentId" uuid, CONSTRAINT "topic_unique" UNIQUE ("name", "isActive"), CONSTRAINT "PK_33aa4ecb4e4f20aa0157ea7ef61" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "topic_closure" ("id_ancestor" uuid NOT NULL, "id_descendant" uuid NOT NULL, CONSTRAINT "PK_60e172bd77583af28fa5f65450f" PRIMARY KEY ("id_ancestor", "id_descendant"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_948c2403b527b118e1094ef549" ON "topic_closure" ("id_ancestor") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_311d6eded78a807651dd412fd0" ON "topic_closure" ("id_descendant") `,
    );
    await queryRunner.query(
      `ALTER TABLE "topic" ADD CONSTRAINT "FK_34dc9c84ae8d3ccee298d4c999d" FOREIGN KEY ("parentId") REFERENCES "topic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "topic_closure" ADD CONSTRAINT "FK_948c2403b527b118e1094ef5497" FOREIGN KEY ("id_ancestor") REFERENCES "topic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "topic_closure" ADD CONSTRAINT "FK_311d6eded78a807651dd412fd02" FOREIGN KEY ("id_descendant") REFERENCES "topic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "topic_closure" DROP CONSTRAINT "FK_311d6eded78a807651dd412fd02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "topic_closure" DROP CONSTRAINT "FK_948c2403b527b118e1094ef5497"`,
    );
    await queryRunner.query(
      `ALTER TABLE "topic" DROP CONSTRAINT "FK_34dc9c84ae8d3ccee298d4c999d"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_311d6eded78a807651dd412fd0"`);
    await queryRunner.query(`DROP INDEX "IDX_948c2403b527b118e1094ef549"`);
    await queryRunner.query(`DROP TABLE "topic_closure"`);
    await queryRunner.query(`DROP TABLE "topic"`);
  }
}
