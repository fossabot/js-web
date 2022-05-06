import { MigrationInterface, QueryRunner } from 'typeorm';

export class pendingMember1651053421283 implements MigrationInterface {
  name = 'pendingMember1651053421283';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "pending_member" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "activationDate" TIMESTAMP WITH TIME ZONE NOT NULL, "organizationId" uuid, CONSTRAINT "user_unique" UNIQUE ("userId"), CONSTRAINT "PK_d9b58d2366f01d746ff84412986" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "pending_member" ADD CONSTRAINT "FK_4f78267b2f7cd77253aa4d0ba1d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pending_member" ADD CONSTRAINT "FK_71e5638a4f5fd3c5344de679d64" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pending_member" DROP CONSTRAINT "FK_71e5638a4f5fd3c5344de679d64"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pending_member" DROP CONSTRAINT "FK_4f78267b2f7cd77253aa4d0ba1d"`,
    );
    await queryRunner.query(`DROP TABLE "pending_member"`);
  }
}
