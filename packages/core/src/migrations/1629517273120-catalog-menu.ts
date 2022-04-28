import { MigrationInterface, QueryRunner } from 'typeorm';

export class catalogMenu1629517273120 implements MigrationInterface {
  name = 'catalogMenu1629517273120';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "language" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "nameEn" text NOT NULL, "nameTh" text NOT NULL, CONSTRAINT "PK_cc0a99e710eb3733f6fb42b1d4c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "catalog_menu_learning_way" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "sequence" smallint NOT NULL DEFAULT '0', "learningWayId" uuid, "menuId" uuid, CONSTRAINT "PK_d4533b9369ad6baf9c9fddfa6c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "catalog_menu_topic" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "sequence" smallint NOT NULL DEFAULT '0', "topicId" uuid, "menuId" uuid, CONSTRAINT "PK_a82e09be6b8d4ab8fc0c9884524" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "catalog_menu" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "topicHeadlineId" uuid, "learningWayHeadlineId" uuid, CONSTRAINT "PK_d140c92f37428bc8908060e65d9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_menu_learning_way" ADD CONSTRAINT "FK_76cb214a1de1a0f7becaeb0a8ae" FOREIGN KEY ("learningWayId") REFERENCES "learning_way"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_menu_learning_way" ADD CONSTRAINT "FK_191025639521bb2291606c8cd58" FOREIGN KEY ("menuId") REFERENCES "catalog_menu"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_menu_topic" ADD CONSTRAINT "FK_9221e3f5e4d6badcf0f88ed8b0c" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_menu_topic" ADD CONSTRAINT "FK_64f6fc9aa7b1c8054ebd2c9beb6" FOREIGN KEY ("menuId") REFERENCES "catalog_menu"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_menu" ADD CONSTRAINT "FK_dcebd393336d89ac1071d1e42f0" FOREIGN KEY ("topicHeadlineId") REFERENCES "language"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_menu" ADD CONSTRAINT "FK_59eec649a207c879b7f3b8238fa" FOREIGN KEY ("learningWayHeadlineId") REFERENCES "language"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "catalog_menu" DROP CONSTRAINT "FK_59eec649a207c879b7f3b8238fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_menu" DROP CONSTRAINT "FK_dcebd393336d89ac1071d1e42f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_menu_topic" DROP CONSTRAINT "FK_64f6fc9aa7b1c8054ebd2c9beb6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_menu_topic" DROP CONSTRAINT "FK_9221e3f5e4d6badcf0f88ed8b0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_menu_learning_way" DROP CONSTRAINT "FK_191025639521bb2291606c8cd58"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalog_menu_learning_way" DROP CONSTRAINT "FK_76cb214a1de1a0f7becaeb0a8ae"`,
    );
    await queryRunner.query(`DROP TABLE "catalog_menu"`);
    await queryRunner.query(`DROP TABLE "catalog_menu_topic"`);
    await queryRunner.query(`DROP TABLE "catalog_menu_learning_way"`);
    await queryRunner.query(`DROP TABLE "language"`);
  }
}
