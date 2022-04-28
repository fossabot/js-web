import { MigrationInterface, QueryRunner } from 'typeorm';

export class productRawIntegration1626051764230 implements MigrationInterface {
  name = 'productRawIntegration1626051764230';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product_country_raw" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "code" character varying NOT NULL, "eligibleCountryName" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Active', CONSTRAINT "UQ_fad87dabb9df6b77c3e15ad667e" UNIQUE ("code"), CONSTRAINT "PK_b7fd3fd487ee7382eb04a6db1f4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fad87dabb9df6b77c3e15ad667" ON "product_country_raw" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_currency_raw" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "code" character varying NOT NULL, "name" character varying NOT NULL, "countryName" character varying, "status" character varying NOT NULL DEFAULT 'Active', "countryId" uuid, CONSTRAINT "UQ_ddeabf34a64528798c4f89e1361" UNIQUE ("code"), CONSTRAINT "PK_63b2895ad87fa4026e786be4d73" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ddeabf34a64528798c4f89e136" ON "product_currency_raw" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_partner_raw" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "code" character varying NOT NULL, "name" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Active', CONSTRAINT "UQ_9de54be1110a22c918b8faca822" UNIQUE ("code"), CONSTRAINT "PK_56deaaeb1cb6488a7e5f88153f5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9de54be1110a22c918b8faca82" ON "product_partner_raw" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_group_raw" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "code" character varying NOT NULL, "name" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Active', CONSTRAINT "UQ_a94278718652c609109ddd8a5ac" UNIQUE ("code"), CONSTRAINT "PK_c0041fab412e37ebfa5d94826c3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a94278718652c609109ddd8a5a" ON "product_group_raw" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_sub_group_raw" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "code" character varying NOT NULL, "name" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Active', "productGroupId" uuid NOT NULL, CONSTRAINT "UQ_6a1f8b4b25ebe0890a46faf22b2" UNIQUE ("code"), CONSTRAINT "PK_af0e55d47a71027b599d928fe62" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6a1f8b4b25ebe0890a46faf22b" ON "product_sub_group_raw" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_sku_group_raw" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "code" character varying NOT NULL, "name" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Active', "productGroupId" uuid, "productSubGroupId" uuid, CONSTRAINT "UQ_8bbfe837ee1673b061b51a3f753" UNIQUE ("code"), CONSTRAINT "PK_826ad2440b11481e58ad6614ddb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8bbfe837ee1673b061b51a3f75" ON "product_sku_group_raw" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_uom_raw" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "code" character varying NOT NULL, "name" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Active', CONSTRAINT "UQ_0c45fe6a338e86d6aebf5e39c90" UNIQUE ("code"), CONSTRAINT "PK_6539f0c7caf313118728f3b849e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0c45fe6a338e86d6aebf5e39c9" ON "product_uom_raw" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_sku_raw" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "code" character varying NOT NULL, "name" character varying NOT NULL, "price" numeric(12,2) NOT NULL, "productAvailability" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Active', "eligibleCountryName" character varying, "subProductGroupName" character varying, "skuGroupName" character varying, "currencyName" character varying, "uomName" character varying, "partnerName" character varying, "unitPerSKU" character varying, "deliveryFormat" character varying, "revenueType" character varying, "thirdPartyLicenseFee" character varying, "shelfLife" character varying, "standardCost" numeric(12,2) NOT NULL, "packageDay" numeric(12,2) NOT NULL, "productSubGroupId" uuid, "skuGroupId" uuid, "currencyId" uuid, "uomId" uuid, "partnerId" uuid, CONSTRAINT "UQ_4efac73676e2b89551a152a5b12" UNIQUE ("code"), CONSTRAINT "PK_107dda1f66efb72ddf888a6c835" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4efac73676e2b89551a152a5b1" ON "product_sku_raw" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_item_raw" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "code" character varying NOT NULL, "name" character varying NOT NULL, "itemStatus" character varying NOT NULL DEFAULT 'Active', "productExpiryDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "language" character varying, "scheduleType" character varying, "status" character varying NOT NULL DEFAULT 'Active', CONSTRAINT "UQ_56aa800d6999c7e9d85cb8954e5" UNIQUE ("code"), CONSTRAINT "PK_719d4ce5adea6738a143f2a8405" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_56aa800d6999c7e9d85cb8954e" ON "product_item_raw" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_promotion_raw" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "code" character varying NOT NULL, "name" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Active', CONSTRAINT "UQ_10e17762a03100cac055815ab75" UNIQUE ("code"), CONSTRAINT "PK_26a8c90561d318cf3a621db3f3f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_10e17762a03100cac055815ab7" ON "product_promotion_raw" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_sku_line_raw" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "skuId" uuid NOT NULL, "productItemId" uuid NOT NULL, "status" character varying NOT NULL DEFAULT 'Active', CONSTRAINT "product_sku_line_raw_unique" UNIQUE ("skuId", "productItemId"), CONSTRAINT "PK_354a026e06e98df09b1554f1c87" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" ADD "displayName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" ADD "productSKUId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" ADD CONSTRAINT "UQ_9d87532eeede0d1c6a7a1bc45db" UNIQUE ("productSKUId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "displayName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" ALTER COLUMN "vatRate" SET DEFAULT '7'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_currency_raw" ADD CONSTRAINT "FK_06a24de37c018508b25fca57b4e" FOREIGN KEY ("countryId") REFERENCES "product_country_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sub_group_raw" ADD CONSTRAINT "FK_23cba075f49f551224610e8f0a3" FOREIGN KEY ("productGroupId") REFERENCES "product_group_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_group_raw" ADD CONSTRAINT "FK_8ea29bf6779c7b86ca323a9f21c" FOREIGN KEY ("productGroupId") REFERENCES "product_group_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_group_raw" ADD CONSTRAINT "FK_e7d66ca551a790b0911d48176e7" FOREIGN KEY ("productSubGroupId") REFERENCES "product_sub_group_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_raw" ADD CONSTRAINT "FK_9c3595b0703a4a8f2dd29e6293a" FOREIGN KEY ("productSubGroupId") REFERENCES "product_sub_group_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_raw" ADD CONSTRAINT "FK_4b528dfb51f08066e96312aada9" FOREIGN KEY ("skuGroupId") REFERENCES "product_sku_group_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_raw" ADD CONSTRAINT "FK_acf212b8636035c5d4e1b85890a" FOREIGN KEY ("currencyId") REFERENCES "product_currency_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_raw" ADD CONSTRAINT "FK_6b1f8d42a5bd103a5be239bf6f6" FOREIGN KEY ("uomId") REFERENCES "product_uom_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_raw" ADD CONSTRAINT "FK_965bed514aea384a5e7ce49946e" FOREIGN KEY ("partnerId") REFERENCES "product_partner_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" ADD CONSTRAINT "FK_9d87532eeede0d1c6a7a1bc45db" FOREIGN KEY ("productSKUId") REFERENCES "product_sku_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_line_raw" ADD CONSTRAINT "FK_18051d80357bdc0a8c6a888659b" FOREIGN KEY ("skuId") REFERENCES "product_sku_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_line_raw" ADD CONSTRAINT "FK_4ad36822178a1f7dbedd95e3bc2" FOREIGN KEY ("productItemId") REFERENCES "product_item_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_sku_line_raw" DROP CONSTRAINT "FK_4ad36822178a1f7dbedd95e3bc2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_line_raw" DROP CONSTRAINT "FK_18051d80357bdc0a8c6a888659b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" DROP CONSTRAINT "FK_9d87532eeede0d1c6a7a1bc45db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_raw" DROP CONSTRAINT "FK_965bed514aea384a5e7ce49946e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_raw" DROP CONSTRAINT "FK_6b1f8d42a5bd103a5be239bf6f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_raw" DROP CONSTRAINT "FK_acf212b8636035c5d4e1b85890a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_raw" DROP CONSTRAINT "FK_4b528dfb51f08066e96312aada9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_raw" DROP CONSTRAINT "FK_9c3595b0703a4a8f2dd29e6293a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_group_raw" DROP CONSTRAINT "FK_e7d66ca551a790b0911d48176e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sku_group_raw" DROP CONSTRAINT "FK_8ea29bf6779c7b86ca323a9f21c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_sub_group_raw" DROP CONSTRAINT "FK_23cba075f49f551224610e8f0a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_currency_raw" DROP CONSTRAINT "FK_06a24de37c018508b25fca57b4e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" ALTER COLUMN "vatRate" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "displayName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" DROP CONSTRAINT "UQ_9d87532eeede0d1c6a7a1bc45db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" DROP COLUMN "productSKUId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" DROP COLUMN "displayName"`,
    );
    await queryRunner.query(`DROP TABLE "product_sku_line_raw"`);
    await queryRunner.query(`DROP INDEX "IDX_10e17762a03100cac055815ab7"`);
    await queryRunner.query(`DROP TABLE "product_promotion_raw"`);
    await queryRunner.query(`DROP INDEX "IDX_56aa800d6999c7e9d85cb8954e"`);
    await queryRunner.query(`DROP TABLE "product_item_raw"`);
    await queryRunner.query(`DROP INDEX "IDX_4efac73676e2b89551a152a5b1"`);
    await queryRunner.query(`DROP TABLE "product_sku_raw"`);
    await queryRunner.query(`DROP INDEX "IDX_0c45fe6a338e86d6aebf5e39c9"`);
    await queryRunner.query(`DROP TABLE "product_uom_raw"`);
    await queryRunner.query(`DROP INDEX "IDX_8bbfe837ee1673b061b51a3f75"`);
    await queryRunner.query(`DROP TABLE "product_sku_group_raw"`);
    await queryRunner.query(`DROP INDEX "IDX_6a1f8b4b25ebe0890a46faf22b"`);
    await queryRunner.query(`DROP TABLE "product_sub_group_raw"`);
    await queryRunner.query(`DROP INDEX "IDX_a94278718652c609109ddd8a5a"`);
    await queryRunner.query(`DROP TABLE "product_group_raw"`);
    await queryRunner.query(`DROP INDEX "IDX_9de54be1110a22c918b8faca82"`);
    await queryRunner.query(`DROP TABLE "product_partner_raw"`);
    await queryRunner.query(`DROP INDEX "IDX_ddeabf34a64528798c4f89e136"`);
    await queryRunner.query(`DROP TABLE "product_currency_raw"`);
    await queryRunner.query(`DROP INDEX "IDX_fad87dabb9df6b77c3e15ad667"`);
    await queryRunner.query(`DROP TABLE "product_country_raw"`);
  }
}
