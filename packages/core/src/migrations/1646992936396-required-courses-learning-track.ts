import { MigrationInterface, QueryRunner } from 'typeorm';

export class requiredCoursesLearningTrack1646992936396
  implements MigrationInterface
{
  name = 'requiredCoursesLearningTrack1646992936396';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "certificate_unlock_rule_learning_track_item" DROP COLUMN "percentage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_section_course" ADD "isRequired" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_enrolled_learning_track_status_enum" AS ENUM('enrolled', 'inProgress', 'completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_learning_track" ADD "status" "public"."user_enrolled_learning_track_status_enum" NOT NULL DEFAULT 'enrolled'`,
    );

    /**
     * Migrate existing enrolled learning track and assign status
     * Set status to inProgress if some courses in learning track has percentage more than 0
     */
    await queryRunner.query(
      `
      UPDATE user_enrolled_learning_track 
      SET status = 'inProgress'
      WHERE id IN (SELECT uelt.id FROM user_enrolled_learning_track uelt 
                  INNER JOIN learning_track lt ON lt.id = uelt."learningTrackId" 
                  INNER JOIN "language" l ON l.id = lt."titleId" 
                  WHERE uelt.id IN (SELECT DISTINCT uelt2.id FROM learning_track lt2
                                    INNER JOIN user_enrolled_learning_track uelt2 ON uelt2."learningTrackId" = lt2.id 
                                    INNER JOIN learning_track_section lts2 ON lts2."learningTrackId" = lt2.id 
                                    LEFT JOIN learning_track_section_course ltsc2 ON ltsc2."learningTrackSectionId" = lts2.id
                                    INNER JOIN course c2 on c2.id = ltsc2."courseId"
                                    LEFT JOIN user_enrolled_course uec2 ON uec2."courseId" = c2.id
                                    WHERE uec2 is not null and uec2.percentage > 0 and uec2.percentage < 100))
      `,
    );

    /**
     * Migrate existing enrolled learning track and assign status
     * If all required course has percentage = 100, completed
     */
    await queryRunner.query(
      `
      UPDATE user_enrolled_learning_track 
      SET status = 'completed'
      WHERE id IN (SELECT uelt.id FROM user_enrolled_learning_track uelt 
                  INNER JOIN learning_track lt ON lt.id = uelt."learningTrackId" 
                  INNER JOIN "language" l ON l.id = lt."titleId" 
                  WHERE uelt.id NOT IN (SELECT DISTINCT uelt2.id FROM learning_track lt2
                                        INNER JOIN user_enrolled_learning_track uelt2 ON uelt2."learningTrackId" = lt2.id 
                                        INNER JOIN learning_track_section lts2 ON lts2."learningTrackId" = lt2.id 
                                        LEFT JOIN learning_track_section_course ltsc2 ON ltsc2."learningTrackSectionId" = lts2.id
                                        INNER JOIN course c2 on c2.id = ltsc2."courseId"
                                        LEFT JOIN user_enrolled_course uec2 ON uec2."courseId" = c2.id
                                        WHERE ltsc2."isRequired" AND (uec2 is null or uec2.percentage < 100)))
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_enrolled_learning_track" DROP COLUMN "status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_enrolled_learning_track_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track_section_course" DROP COLUMN "isRequired"`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate_unlock_rule_learning_track_item" ADD "percentage" integer NOT NULL DEFAULT '100'`,
    );
  }
}
