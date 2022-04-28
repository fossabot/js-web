import { MigrationInterface, QueryRunner } from 'typeorm';

export class newProductAr1631879376899 implements MigrationInterface {
  name = 'newProductAr1631879376899';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "coupon_detail_ar_raw" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "couponCode" character varying NOT NULL, "couponUniqueNo" character varying NOT NULL, "systemCreatedDate" TIMESTAMP WITH TIME ZONE NOT NULL, "used" boolean NOT NULL, CONSTRAINT "UQ_c0cb58ba120c417f5fb47a5a614" UNIQUE ("couponUniqueNo"), CONSTRAINT "PK_6cac59f416ba3c5caa373fe1af1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "coupon_master_ar_raw" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "couponCode" character varying NOT NULL, "couponName" character varying NOT NULL, "promoType" character varying NOT NULL, "couponType" character varying NOT NULL, "promotion" numeric(12,2) NOT NULL, "discountUom" character varying NOT NULL, "status" character varying NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE DEFAULT now(), "endDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "quota" integer NOT NULL, "redeem" integer NOT NULL, "remain" integer NOT NULL, "campaignBudget" numeric(12,2) NOT NULL, "budgetUom" text, "referenceCampaignName" text, "usageCondition" text, "productGroup" character varying NOT NULL, "subProductGroup" character varying NOT NULL, "eligibleSkuType" character varying NOT NULL, "createBy" character varying NOT NULL, "updateDate" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_ebb22fc819986c828014fd9774a" UNIQUE ("couponCode"), CONSTRAINT "PK_5f751583f06045f55a9bb371aca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "eligible_sku_code_ar_raw" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "eligibleSkuCode" character varying NOT NULL, "eligibleSkuName" character varying, "couponCode" character varying NOT NULL, CONSTRAINT "sku_code_coupon_code_unique" UNIQUE ("eligibleSkuCode", "couponCode"), CONSTRAINT "PK_6485baef052a3fd40ad64a06e76" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_ar_raw" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "productGroup" character varying NOT NULL, "subProductGroup" character varying NOT NULL, "partner" character varying NOT NULL, "deliveryFormat" character varying NOT NULL, "itemCategory" character varying NOT NULL, "no" character varying NOT NULL, "description" character varying NOT NULL, "periodYear" integer NOT NULL, "periodMonth" integer NOT NULL, "periodDay" integer NOT NULL, "baseUnitOfMeasure" character varying NOT NULL, "unitPrice" numeric(12,2) NOT NULL, "currency" character varying NOT NULL, "countryRegionOfOriginCode" character varying NOT NULL, "productAvailability" character varying NOT NULL, "shelfLife" character varying NOT NULL, "revenueType" character varying NOT NULL, "thirdPartyLicenseFee" character varying NOT NULL, CONSTRAINT "UQ_25a230d91f6a5f6843588f4de0d" UNIQUE ("no"), CONSTRAINT "PK_5ffa7bc4d0d0bd755281aba2816" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "product_ar_raw"`);
    await queryRunner.query(`DROP TABLE "eligible_sku_code_ar_raw"`);
    await queryRunner.query(`DROP TABLE "coupon_master_ar_raw"`);
    await queryRunner.query(`DROP TABLE "coupon_detail_ar_raw"`);
  }
}
