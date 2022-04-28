import { MigrationInterface, QueryRunner } from 'typeorm';

export class notificationReceiverRoles1649136148742
  implements MigrationInterface
{
  name = 'notificationReceiverRoles1649136148742';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "email_notification_receiver_role" DROP CONSTRAINT "FK_0e1732d1717fc3ef75a04b03200"`,
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "email_notification_receiver_role" DROP CONSTRAINT "FK_bafc26821f24063bb84e8b9a1b1"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS  "email_notification_receiver_role"`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."email_notification_receiverroles_enum" AS ENUM('learner', 'instructor', 'moderator')`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" ADD "receiverRoles" "public"."email_notification_receiverroles_enum" array NOT NULL DEFAULT '{learner}'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."push_notification_receiverroles_enum" AS ENUM('learner', 'instructor', 'moderator')`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification" ADD "receiverRoles" "public"."push_notification_receiverroles_enum" array NOT NULL DEFAULT '{learner}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "push_notification" DROP COLUMN "receiverRoles"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."push_notification_receiverroles_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" DROP COLUMN "receiverRoles"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."email_notification_receiverroles_enum"`,
    );

    await queryRunner.query(
      `CREATE TABLE "email_notification_receiver_role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "notificationId" uuid NOT NULL, "roleId" uuid NOT NULL, CONSTRAINT "email_notification_receiver_role_unique" UNIQUE ("notificationId", "roleId"), CONSTRAINT "PK_962fa7a3f3635afa29f88aba983" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification_receiver_role" ADD CONSTRAINT "FK_bafc26821f24063bb84e8b9a1b1" FOREIGN KEY ("notificationId") REFERENCES "email_notification"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification_receiver_role" ADD CONSTRAINT "FK_0e1732d1717fc3ef75a04b03200" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
