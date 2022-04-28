import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getManager } from 'typeorm';
import { UserCourseOutlineProgressStatus } from '../course/UserCourseOutlineProgressStatus.enum';

@Injectable()
export class CoorpacademyService {
  constructor(private readonly configService: ConfigService) {}

  async importCoorpacademyTSV(filePath: string) {
    await getManager().query(`
      DELETE FROM user_third_party_coorpacademy_progress;
      -- Clear Old data
      CREATE EXTENSION IF NOT EXISTS aws_s3 CASCADE;

      SELECT aws_s3.table_import_from_s3(
        'user_third_party_coorpacademy_progress',
        '"#Username", "Common Name", "Engine", "Online course ID", "Course Name", "Course Level", "Registration Date", "Completion Date", "Status", "Completed SCOs%", "Time in Training (in min)", "Stars earned", "Live(s) remaining", "Remaining Extra Life", "Discipline ref"',
        '(FORMAT csv, DELIMITER E''\t'', HEADER)',
        aws_commons.create_s3_uri(
        '${this.configService.get('S3_MAIN_BUCKET_NAME')}',
        '${filePath}',
        '${this.configService.get('AWS_REGION')}')
        );
    `);
  }

  async processCoorpacademyProgress() {
    await getManager().query(
      `
        INSERT INTO user_course_outline_progress (status, percentage, "userId", "courseOutlineId")
        -- Upsert behavior.
        SELECT
	        transformed.status::user_course_outline_progress_status_enum,
	        transformed.percentage::integer,
	        transformed."userId",
	        transformed."courseOutlineId"
        FROM (
	        SELECT
                "user".id AS "userId",
		        course_outline.id AS "courseOutlineId",
		        "Completed SCOs%" AS percentage,
		        CASE WHEN "Status" = 'In Progress' THEN $1
		        WHEN "Status" = 'Completed' THEN $2
		        ELSE $3
		        END AS status
	        FROM 
		        user_third_party_coorpacademy_progress AS raw
		
		        INNER JOIN "user"
		        ON "user".email = raw."#Username"
		
		        INNER JOIN course_outline
		        ON course_outline. "thirdPartyCourseCode" = raw. "Online course ID"
		        )
        AS transformed
        -- In case the progress already existed, update the current one instead.
        ON CONFLICT ON CONSTRAINT user_course_outline_progress_unique
        DO UPDATE SET 
            status = EXCLUDED.status, 
            percentage = EXCLUDED.percentage
    `,
      [
        UserCourseOutlineProgressStatus.IN_PROGRESS,
        UserCourseOutlineProgressStatus.COMPLETED,
        UserCourseOutlineProgressStatus.ENROLLED,
      ],
    );
  }
}
