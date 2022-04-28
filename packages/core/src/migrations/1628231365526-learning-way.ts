import { MigrationInterface, QueryRunner } from 'typeorm';

export class learningWay1628231365526 implements MigrationInterface {
  name = 'learningWay1628231365526';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "learning_way" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "name" character varying(255) NOT NULL, "parentId" uuid, CONSTRAINT "learning_way_unique" UNIQUE ("name", "isActive"), CONSTRAINT "PK_f5ab4c359f6859743e1b4838bb6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "learning_way_closure" ("id_ancestor" uuid NOT NULL, "id_descendant" uuid NOT NULL, CONSTRAINT "PK_3ea79d3e38c4d2593f57f471b3a" PRIMARY KEY ("id_ancestor", "id_descendant"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1128d1fa36068d5552434f26d2" ON "learning_way_closure" ("id_ancestor") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d5e99d25bcfb0cd095c15d24a1" ON "learning_way_closure" ("id_descendant") `,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_way" ADD CONSTRAINT "FK_56dfd2c637e6515bc502f739c34" FOREIGN KEY ("parentId") REFERENCES "learning_way"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_way_closure" ADD CONSTRAINT "FK_1128d1fa36068d5552434f26d25" FOREIGN KEY ("id_ancestor") REFERENCES "learning_way"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_way_closure" ADD CONSTRAINT "FK_d5e99d25bcfb0cd095c15d24a15" FOREIGN KEY ("id_descendant") REFERENCES "learning_way"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "learning_way_closure" DROP CONSTRAINT "FK_d5e99d25bcfb0cd095c15d24a15"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_way_closure" DROP CONSTRAINT "FK_1128d1fa36068d5552434f26d25"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_way" DROP CONSTRAINT "FK_56dfd2c637e6515bc502f739c34"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_d5e99d25bcfb0cd095c15d24a1"`);
    await queryRunner.query(`DROP INDEX "IDX_1128d1fa36068d5552434f26d2"`);
    await queryRunner.query(`DROP TABLE "learning_way_closure"`);
    await queryRunner.query(`DROP TABLE "learning_way"`);
  }
}
