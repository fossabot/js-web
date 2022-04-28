import { MigrationInterface, QueryRunner } from 'typeorm';

export class userArchivedLearningTrack1639632069860
  implements MigrationInterface
{
  name = 'userArchivedLearningTrack1639632069860';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_archived_learning_track" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "learningTrackId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "user_archived_learning_track_unique" UNIQUE ("learningTrackId", "userId"), CONSTRAINT "PK_c622ed9af4bd0116cc0a898f050" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_archived_learning_track" ADD CONSTRAINT "FK_0a107823bc6672b21610411053f" FOREIGN KEY ("learningTrackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_archived_learning_track" ADD CONSTRAINT "FK_5a1b9902a51e2eeda994b9a598e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_archived_learning_track" DROP CONSTRAINT "FK_5a1b9902a51e2eeda994b9a598e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_archived_learning_track" DROP CONSTRAINT "FK_0a107823bc6672b21610411053f"`,
    );
    await queryRunner.query(`DROP TABLE "user_archived_learning_track"`);
  }
}
