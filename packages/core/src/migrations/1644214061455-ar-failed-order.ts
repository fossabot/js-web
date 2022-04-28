import { MigrationInterface, QueryRunner } from 'typeorm';

export class arFailedOrder1644214061455 implements MigrationInterface {
  name = 'arFailedOrder1644214061455';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ar_failed_order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "orderId" uuid NOT NULL, "dueRetry" TIMESTAMP WITH TIME ZONE NOT NULL, "attempt" integer NOT NULL DEFAULT '0', CONSTRAINT "failed_order_unique" UNIQUE ("orderId"), CONSTRAINT "PK_93bcda41af0335239ebd9f867ed" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "ar_failed_order" ADD CONSTRAINT "FK_e1fb1b17c34caf7e92a97a1ffb6" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ar_failed_order" DROP CONSTRAINT "FK_e1fb1b17c34caf7e92a97a1ffb6"`,
    );
    await queryRunner.query(`DROP TABLE "ar_failed_order"`);
  }
}
