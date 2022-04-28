import { MigrationInterface, QueryRunner } from 'typeorm';

export class linkingOrderCoupon1643338152597 implements MigrationInterface {
  name = 'linkingOrderCoupon1643338152597';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" ADD "metaData" jsonb`);
    await queryRunner.query(`ALTER TABLE "order" ADD "couponId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_8e2b018ed0091fa11714dd7b3e1" FOREIGN KEY ("couponId") REFERENCES "coupon_detail_ar_raw"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `
      UPDATE
        "order"
      SET
        "metaData" = CAST(CONCAT('{ "price": ', "ref_order"."price"::varchar , ', "grandTotal": ', "ref_order"."grand_total"::varchar, ', "subTotal": ', "ref_order"."sub_total"::varchar , ', "discount": ', "ref_order"."discount"::varchar, ', "vat": ', "ref_order"."vat"::varchar , ', "vatRate": ', "ref_order"."vatRate"::varchar, ' }') AS JSONB)
      FROM
      (
        SELECT
          *,
          ("sub_total" * "vatRate" / 100)::decimal(13,2) AS "vat",
          ("sub_total" + ("sub_total" * "vatRate" / 100))::decimal(13, 2) AS "grand_total"
        FROM
        (
          SELECT
            *,
            CASE
              WHEN "price" <= "discount" THEN 0
              WHEN "price" > "discount" THEN "price" - "discount"
              ELSE "price"
            END as "sub_total"
          FROM
          (
            SELECT
              "o"."id" as "order_id",
              "p"."price",
              "p"."vatRate",
              COALESCE("cm"."promotion", 0) AS "promotion",
              "cm"."discountUom",
              CAST(CASE 
                WHEN "cm"."discountUom" = '%' THEN ("p"."price" * COALESCE("cm"."promotion", 0) / 100)
                WHEN "cm"."discountUom" = 'THB' THEN COALESCE("cm"."promotion", 0)
                ELSE 0
              END AS DECIMAL(13, 2)) as "discount"
            FROM "order" "o"
            LEFT JOIN "subscription_plan" "p" ON "o"."subscriptionPlanId" = "p"."id"
            LEFT JOIN "coupon_detail_ar_raw" "c" ON "o"."couponId" = "c"."id"
            LEFT JOIN "coupon_master_ar_raw" "cm" ON "cm"."couponCode" = "c"."couponCode"
          ) AS "order_raw_pricing"
        ) AS "order_pricing"
      ) AS "ref_order"
      WHERE "order"."id" = "ref_order"."order_id"
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_8e2b018ed0091fa11714dd7b3e1"`,
    );
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "couponId"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "metaData"`);
  }
}
