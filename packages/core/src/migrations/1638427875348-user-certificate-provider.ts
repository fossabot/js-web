import { MigrationInterface, QueryRunner } from 'typeorm';

export class userCertificateProvider1638427875348
  implements MigrationInterface
{
  name = 'userCertificateProvider1638427875348';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_certificate" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "certificateId" uuid NOT NULL, "userId" uuid NOT NULL, "completedDate" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "user_certificate_unique" UNIQUE ("userId", "certificateId"), CONSTRAINT "PK_52423baef0f83116cd08ad6a61a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate" ADD "provider" character varying NOT NULL DEFAULT 'SEAC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_certificate" ADD CONSTRAINT "FK_4db3a5aca2a8b0be4e8d86bc93f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_certificate" ADD CONSTRAINT "FK_ef24674e87d86ad91bd569a1e30" FOREIGN KEY ("certificateId") REFERENCES "certificate"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_certificate" DROP CONSTRAINT "FK_ef24674e87d86ad91bd569a1e30"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_certificate" DROP CONSTRAINT "FK_4db3a5aca2a8b0be4e8d86bc93f"`,
    );
    await queryRunner.query(`ALTER TABLE "certificate" DROP COLUMN "provider"`);
    await queryRunner.query(`DROP TABLE "user_certificate"`);
  }
}
