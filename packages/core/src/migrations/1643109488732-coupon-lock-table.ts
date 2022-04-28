import { MigrationInterface, QueryRunner } from 'typeorm';

export class couponLockTable1643109488732 implements MigrationInterface {
  name = 'couponLockTable1643109488732';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "coupon_lock" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "couponDetailId" uuid NOT NULL, "userId" uuid NOT NULL, "expiresOn" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "coupon_lock_unique" UNIQUE ("userId", "couponDetailId"), CONSTRAINT "PK_8bc62e2cb34efefd8c32feef46d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_lock" ADD CONSTRAINT "FK_567fe1bf55ec7f1b06e9e87b270" FOREIGN KEY ("couponDetailId") REFERENCES "coupon_detail_ar_raw"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_lock" ADD CONSTRAINT "FK_8ea83973528d734a0221ce82ff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "coupon_lock" DROP CONSTRAINT "FK_8ea83973528d734a0221ce82ff9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_lock" DROP CONSTRAINT "FK_567fe1bf55ec7f1b06e9e87b270"`,
    );
    await queryRunner.query(`DROP TABLE "coupon_lock"`);
  }
}
