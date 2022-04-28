import * as csv from 'fast-csv';
import { Injectable, Logger } from '@nestjs/common';
import { formatWithTimezone } from '@seaccentral/core/dist/utils/date';
import { DEFAULT_TIMEZONE } from '@seaccentral/core/dist/utils/constants';
import { CourseSessionService } from './courseSession.service';
import { CourseSessionCancellationService } from './courseSessionCancellation.service';
import { UserSessionManagement } from './dto/course-sessions/UserSessionManagement.dto';

@Injectable()
export class CourseSessionReportService {
  private readonly logger = new Logger(CourseSessionReportService.name);

  constructor(
    private readonly courseSessionService: CourseSessionService,
    private readonly courseSessionCancellationService: CourseSessionCancellationService,
  ) {}

  async generateSessionParticipantsReport(sessionId: string) {
    const [session, activeStudents, cancelledStudents] = await Promise.all([
      this.courseSessionService.findCourseSessionById(sessionId),
      this.getAllActiveStudentsForSession(sessionId, []),
      this.getAllCancelledStudentsForSession(sessionId, []),
    ]);

    const stream = csv.format({ headers: true });
    stream.on('error', (err) => this.logger.error(err));

    ([] as UserSessionManagement[])
      .concat(cancelledStudents, activeStudents)
      .forEach((user) => {
        const data = {
          'Course Title': session.courseOutline.course.title?.nameEn,
          'Course outline title': session.courseOutline.title?.nameEn,
          'Session start date/time': formatWithTimezone(
            session.startDateTime,
            DEFAULT_TIMEZONE,
            'dd-MMM-yyyy HH:mm',
          ),
          'Session end date/time': formatWithTimezone(
            session.endDateTime,
            DEFAULT_TIMEZONE,
            'dd-MMM-yyyy HH:mm',
          ),
          Instructor: session.courseSessionInstructor[0].instructor.fullName,
          Name: user.firstName,
          Surname: user.lastName,
          Email: user.email,
          'Organization name': user.organizationName || '',
          Phone: user.phoneNumber,
          'Attending status': user.bookingStatus,
          'Reason for cancellation': user.cancelledReason || '',
        };

        stream.write(data);
      });

    stream.end();

    return {
      stream,
      fileName: 'session_participants_report',
    };
  }

  private async getAllActiveStudentsForSession(
    sessionId: string,
    activeStudentsArr: UserSessionManagement[],
    startFromPage = 1,
  ): Promise<UserSessionManagement[]> {
    const take = 1000;
    const skip = startFromPage > 1 ? take * (startFromPage - 1) : 0;

    const activeStudentsForSession =
      await this.courseSessionService.getActiveStudents(sessionId, {
        skip,
        take,
        search: '',
        perPage: take,
        order: 'DESC',
        searchField: '',
        orderBy: 'name',
        page: startFromPage,
      });

    if (activeStudentsForSession.users.length < 1) return activeStudentsArr;

    activeStudentsArr = activeStudentsArr.concat(
      activeStudentsForSession.users,
    );
    return this.getAllActiveStudentsForSession(
      sessionId,
      activeStudentsArr,
      startFromPage + 1,
    );
  }

  private async getAllCancelledStudentsForSession(
    sessionId: string,
    cancelledStudentsArr: UserSessionManagement[],
    startFromPage = 1,
  ): Promise<UserSessionManagement[]> {
    const take = 1000;
    const skip = startFromPage > 1 ? take * (startFromPage - 1) : 0;

    const cancelledStudentsForSession =
      await this.courseSessionCancellationService.getAttendants(sessionId, {
        skip,
        take,
        search: '',
        perPage: take,
        order: 'DESC',
        searchField: '',
        orderBy: 'name',
        page: startFromPage,
      });

    if (cancelledStudentsForSession.users.length < 1)
      return cancelledStudentsArr;

    cancelledStudentsArr = cancelledStudentsArr.concat(
      cancelledStudentsForSession.users,
    );

    return this.getAllCancelledStudentsForSession(
      sessionId,
      cancelledStudentsArr,
      startFromPage + 1,
    );
  }
}
