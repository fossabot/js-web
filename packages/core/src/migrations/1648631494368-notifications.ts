import { MigrationInterface, QueryRunner } from 'typeorm';

export class notifications1648631494368 implements MigrationInterface {
  name = 'notifications1648631494368';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "email_format" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "formatName" character varying(255) NOT NULL, "teamName" character varying(255) NOT NULL, "headerImageKey" character varying(200), "footerImagekey" character varying(200), "footerText" text, "footerHTML" text, "copyRightsText" text, "isDefault" boolean NOT NULL DEFAULT false, CONSTRAINT "email_format_unique" UNIQUE ("formatName"), CONSTRAINT "PK_622bc120589b677823b58e009d2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."email_notification_category_key_enum" AS ENUM('assignment', 'booking', 'certificate', 'membership', 'reminder')`,
    );
    await queryRunner.query(
      `CREATE TABLE "email_notification_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "key" "public"."email_notification_category_key_enum" NOT NULL, "description" character varying(500), CONSTRAINT "UQ_1d646e627e473d0225644b5a6dd" UNIQUE ("name"), CONSTRAINT "UQ_a848af7b916d44043182b0169ac" UNIQUE ("key"), CONSTRAINT "PK_ce7ad903cf4655825b7dadb62f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."email_notification_sub_category_key_enum" AS ENUM('membershipWelcome', 'membershipVerifyEmail', 'membershipExpiryReminder', 'membershipCompletedAllCourses', 'membershipSetPassword', 'membershipResetPassword', 'membershipBuyNewPackage', 'bookingConfirmationF2F', 'bookingConfirmationVirtual', 'bookingCancellation', 'bookingCancellationByAdmin', 'bookingInstructorChanged', 'bookingScheduleChanged', 'certificateUnlocked', 'reminderQuizAfterSession', 'reminderActivateAccount', 'reminderBookSessionF2F', 'reminderBookSessionVirtual', 'reminderCompleteAssignedLearningTrack', 'reminderCompleteAssignedCourse', 'reminderTodoAsessment', 'reminderBookingAfterInactive', 'assignmentSessionF2F', 'assignmentSessionVirtual', 'assignmentCourse', 'assignmentLearningTrack')`,
    );
    await queryRunner.query(
      `CREATE TABLE "email_notification_sub_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "key" "public"."email_notification_sub_category_key_enum" NOT NULL, "description" character varying(500), "parentId" uuid NOT NULL, CONSTRAINT "UQ_04a35108071a5525d34751ab954" UNIQUE ("name"), CONSTRAINT "UQ_04bdbeceab1c0bb8b8b3de67c70" UNIQUE ("key"), CONSTRAINT "PK_a06a4b6e6fd1a64da0aaae07cfc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "email_notification_sender_domain" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "domain" character varying(200), CONSTRAINT "PK_88a568581e69964ee96d56e0327" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification_trigger_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "displayName" character varying(200) NOT NULL, "triggerSeconds" integer array NOT NULL DEFAULT '{}', CONSTRAINT "notification_trigger_type_unique" UNIQUE ("displayName", "triggerSeconds"), CONSTRAINT "PK_4267d59b02d80ab98f9fb738261" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "email_notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying(255) NOT NULL, "categoryId" uuid NOT NULL, "senderEmailUser" character varying(100) NOT NULL, "subjectId" uuid NOT NULL, "bodyHTMLId" uuid, "bodyTextId" uuid, "triggerTypeId" uuid NOT NULL, "emailFormatEnId" uuid NOT NULL, "emailFormatThId" uuid NOT NULL, "senderEmailDomainId" uuid NOT NULL, CONSTRAINT "email_notification_unique" UNIQUE ("categoryId"), CONSTRAINT "PK_0ebb489f20426be0ad1b2e55fc5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."push_notification_category_key_enum" AS ENUM('assignment', 'certificate', 'learningActivity', 'membership', 'reminder')`,
    );
    await queryRunner.query(
      `CREATE TABLE "push_notification_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "key" "public"."push_notification_category_key_enum" NOT NULL, "description" character varying(500), CONSTRAINT "UQ_88a67e24a59fe335f780efc5758" UNIQUE ("name"), CONSTRAINT "UQ_b853d40290b4fe7be7ba6577606" UNIQUE ("key"), CONSTRAINT "PK_e82eca33b10410e48918147fb73" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."push_notification_sub_category_key_enum" AS ENUM('learningActivityCourseEnrollment', 'learningActivityCourseCompletion', 'learningActivityLearningTrackEnrollment', 'learningActivityLearningTrackCompletion', 'learningActivitySessionBooked', 'learningActivityBookingCancelledByUser', 'learningActivityBookingAssignedByUser', 'learningActivityBookingCancelledByAdmin', 'assignmentSession', 'assignmentCourse', 'assignmentLearningTrack', 'membershipRenewal', 'membershipActivated', 'membershipExpiringRemider', 'certificateUnlocked', 'reminderCompleteRequiredCourse', 'reminderCompleteRequiredLearningTrack', 'reminderUpcomingBookedEvent', 'reminderAssessmentResultRequired', 'reminderAssessmentUnlocked')`,
    );
    await queryRunner.query(
      `CREATE TABLE "push_notification_sub_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "key" "public"."push_notification_sub_category_key_enum" NOT NULL, "description" character varying(500), "parentId" uuid NOT NULL, CONSTRAINT "UQ_e38836d9e99457c43d16a7869bb" UNIQUE ("name"), CONSTRAINT "UQ_5a17c96766b19ac078928a25e5d" UNIQUE ("key"), CONSTRAINT "PK_49a2df6755c7399564974b25c13" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "push_notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying(255) NOT NULL, "categoryId" uuid NOT NULL, "contentId" uuid, "triggerTypeId" uuid NOT NULL, CONSTRAINT "push_notification_unique" UNIQUE ("categoryId"), CONSTRAINT "PK_b7e0210528850d5f548629ed593" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "system_announcement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "messageStartDateTime" TIMESTAMP WITH TIME ZONE, "messageEndDateTime" TIMESTAMP WITH TIME ZONE, "startDateTime" TIMESTAMP WITH TIME ZONE NOT NULL, "endDateTime" TIMESTAMP WITH TIME ZONE NOT NULL, "imageKey" character varying(200), "titleId" uuid, "messageId" uuid, CONSTRAINT "PK_afe01f4827b72d7c520161bab25" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "notificationId" uuid NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "notifyDate" TIMESTAMP WITH TIME ZONE NOT NULL, "variables" jsonb NOT NULL, CONSTRAINT "user_notification_unique" UNIQUE ("userId", "notificationId", "notifyDate"), CONSTRAINT "PK_8840aac86dec5f669c541ce67d4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification_sub_category" ADD CONSTRAINT "FK_735ccb17dae19c611f07d801c8a" FOREIGN KEY ("parentId") REFERENCES "email_notification_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" ADD CONSTRAINT "FK_5c7bd4ad009cd76f2dbb463ec0b" FOREIGN KEY ("subjectId") REFERENCES "language"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" ADD CONSTRAINT "FK_bc052270ec67119a12fe6d0a2e4" FOREIGN KEY ("bodyHTMLId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" ADD CONSTRAINT "FK_4c8d8cba5ef7dc76a6c8f8a5719" FOREIGN KEY ("bodyTextId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" ADD CONSTRAINT "FK_80af15916bf83e2807bdffbf864" FOREIGN KEY ("triggerTypeId") REFERENCES "notification_trigger_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" ADD CONSTRAINT "FK_001219d85db885da4977df03cd5" FOREIGN KEY ("categoryId") REFERENCES "email_notification_sub_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" ADD CONSTRAINT "FK_03eaa5dd1c2d760943d042f5f6f" FOREIGN KEY ("emailFormatEnId") REFERENCES "email_format"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" ADD CONSTRAINT "FK_848e9a26b922627853bbdc99e1c" FOREIGN KEY ("emailFormatThId") REFERENCES "email_format"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" ADD CONSTRAINT "FK_4a98257c8331e84aaed4465fc61" FOREIGN KEY ("senderEmailDomainId") REFERENCES "email_notification_sender_domain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification_sub_category" ADD CONSTRAINT "FK_b8b203613335bc1eae7d8053492" FOREIGN KEY ("parentId") REFERENCES "push_notification_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification" ADD CONSTRAINT "FK_be8e34041864bb26e5ee5534320" FOREIGN KEY ("contentId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification" ADD CONSTRAINT "FK_8ec9cb7b8a7201ac1c66a24e944" FOREIGN KEY ("triggerTypeId") REFERENCES "notification_trigger_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification" ADD CONSTRAINT "FK_4d3edb84dd2177ffd0c84cdd038" FOREIGN KEY ("categoryId") REFERENCES "push_notification_sub_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_announcement" ADD CONSTRAINT "FK_f858d3524f1a5871730c50a1e22" FOREIGN KEY ("titleId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_announcement" ADD CONSTRAINT "FK_a7f3a70548117ee2c3ddb3430d6" FOREIGN KEY ("messageId") REFERENCES "language"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification" ADD CONSTRAINT "FK_dce2a8927967051c447ae10bc8b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification" ADD CONSTRAINT "FK_680af16b67e94e2cb693b9e9033" FOREIGN KEY ("notificationId") REFERENCES "push_notification"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_notification" DROP CONSTRAINT "FK_680af16b67e94e2cb693b9e9033"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification" DROP CONSTRAINT "FK_dce2a8927967051c447ae10bc8b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_announcement" DROP CONSTRAINT "FK_a7f3a70548117ee2c3ddb3430d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_announcement" DROP CONSTRAINT "FK_f858d3524f1a5871730c50a1e22"`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification" DROP CONSTRAINT "FK_4d3edb84dd2177ffd0c84cdd038"`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification" DROP CONSTRAINT "FK_8ec9cb7b8a7201ac1c66a24e944"`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification" DROP CONSTRAINT "FK_be8e34041864bb26e5ee5534320"`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification_sub_category" DROP CONSTRAINT "FK_b8b203613335bc1eae7d8053492"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" DROP CONSTRAINT "FK_4a98257c8331e84aaed4465fc61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" DROP CONSTRAINT "FK_848e9a26b922627853bbdc99e1c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" DROP CONSTRAINT "FK_03eaa5dd1c2d760943d042f5f6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" DROP CONSTRAINT "FK_001219d85db885da4977df03cd5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" DROP CONSTRAINT "FK_80af15916bf83e2807bdffbf864"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" DROP CONSTRAINT "FK_4c8d8cba5ef7dc76a6c8f8a5719"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" DROP CONSTRAINT "FK_bc052270ec67119a12fe6d0a2e4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification" DROP CONSTRAINT "FK_5c7bd4ad009cd76f2dbb463ec0b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notification_sub_category" DROP CONSTRAINT "FK_735ccb17dae19c611f07d801c8a"`,
    );
    await queryRunner.query(`DROP TABLE "user_notification"`);
    await queryRunner.query(`DROP TABLE "system_announcement"`);
    await queryRunner.query(`DROP TABLE "push_notification"`);
    await queryRunner.query(`DROP TABLE "push_notification_sub_category"`);
    await queryRunner.query(
      `DROP TYPE "public"."push_notification_sub_category_key_enum"`,
    );
    await queryRunner.query(`DROP TABLE "push_notification_category"`);
    await queryRunner.query(
      `DROP TYPE "public"."push_notification_category_key_enum"`,
    );
    await queryRunner.query(`DROP TABLE "email_notification"`);
    await queryRunner.query(`DROP TABLE "notification_trigger_type"`);
    await queryRunner.query(`DROP TABLE "email_notification_sender_domain"`);
    await queryRunner.query(`DROP TABLE "email_notification_sub_category"`);
    await queryRunner.query(
      `DROP TYPE "public"."email_notification_sub_category_key_enum"`,
    );
    await queryRunner.query(`DROP TABLE "email_notification_category"`);
    await queryRunner.query(
      `DROP TYPE "public"."email_notification_category_key_enum"`,
    );
    await queryRunner.query(`DROP TABLE "email_format"`);
  }
}
