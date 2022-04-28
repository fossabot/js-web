import { MigrationInterface, QueryRunner } from 'typeorm';

export class promoBanner1639020430446 implements MigrationInterface {
  name = 'promoBanner1639020430446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "promo_banner" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "assetKey" character varying NOT NULL, "overlayColor" text, "textColor" character varying NOT NULL DEFAULT 'black', "href" character varying NOT NULL, "sequence" integer NOT NULL, "headerId" uuid, "subtitleId" uuid, "ctaId" uuid, CONSTRAINT "UQ_fbd7bc61991a0f8c5da61a9a32c" UNIQUE ("sequence"), CONSTRAINT "PK_98424d35c7d88d47b90aafacbf7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_banner" ADD CONSTRAINT "FK_7a548ec9657784aae5fc32b2151" FOREIGN KEY ("headerId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_banner" ADD CONSTRAINT "FK_48564fbf2560f7f865e4bf346e3" FOREIGN KEY ("subtitleId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_banner" ADD CONSTRAINT "FK_c26b5f2e9b32fdb71d48a5d2f3e" FOREIGN KEY ("ctaId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "promo_banner" DROP CONSTRAINT "FK_c26b5f2e9b32fdb71d48a5d2f3e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_banner" DROP CONSTRAINT "FK_48564fbf2560f7f865e4bf346e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_banner" DROP CONSTRAINT "FK_7a548ec9657784aae5fc32b2151"`,
    );
    await queryRunner.query(`DROP TABLE "promo_banner"`);
  }
}
