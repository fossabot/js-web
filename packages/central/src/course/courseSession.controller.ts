import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  Request,
  Response,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  BACKEND_ADMIN_CONTROL,
  GOD_MODE,
} from '@seaccentral/core/dist/access-control/constants';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import {
  PolicyGuard,
  UserPolicies,
} from '@seaccentral/core/dist/access-control/policy.guard';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { CourseSession } from '@seaccentral/core/dist/course/CourseSession.entity';
import { Reason } from '@seaccentral/core/dist/course/UserCourseSessionCancellationLog.entity';
import { UserLogInterceptor } from '@seaccentral/core/dist/user-log/userLogInterceptor.interceptor';
import { CourseSessionUploadHistory } from '@seaccentral/core/dist/course/CourseSessionUploadHistory.entity';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import {
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
  getSearchRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import {
  userLogCategory,
  userLogSubCategory,
} from '@seaccentral/core/dist/user-log/constants';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { Response as ExpressResponse } from 'express';
import { Connection } from 'typeorm';

import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';
import { NOTIFICATION_DATE_FORMAT } from '@seaccentral/core/dist/utils/constants';
import { NotificationVariableDict as NV } from '@seaccentral/core/dist/notification/NotificationVariableDict';

import { getLanguageFromDate } from '@seaccentral/core/dist/utils/language';
import { CourseService } from './course.service';
import { CourseSessionMe } from './dto/CourseSessionMe.dto';
import { CourseSessionService } from './courseSession.service';
import { CourseSessionQueryDto } from './dto/CourseSessionQuery.dto';
import IRequestWithUser from '../invitation/interface/IRequestWithUser';

import { CourseSessionCancellationService } from './courseSessionCancellation.service';
import { CourseSessionReportService } from './courseSessionReport.service';
import { AddStudentToSessionDto } from './dto/course-sessions/AddStudentsToSession.dto';
import {
  CreateCourseSessionBody,
  UpdateCourseSessionBody,
} from './dto/course-sessions/CourseSession.dto';
import { UserSessionManagement } from './dto/course-sessions/UserSessionManagement.dto';
import { CourseSessionBookingResponse } from './dto/CourseSessionBookingResponse.dto';
import { CourseSessionBulkUploadBody } from './dto/CourseSessionBulkUploadBody.dto';
import { CourseSessionCalendarResponseDto } from './dto/CourseSessionCalendar.dto';
import { CourseSessionCalendarQuery } from './dto/CourseSessionCalendarQuery.dto';
import { CourseSessionCancellationBody } from './dto/CourseSessionCancellationBody.dto';
import { CourseSessionMarkAttendanceBody } from './dto/CourseSessionMarkAttendanceBody.dto';

import { CourseSessionOverviewResponse } from './dto/CourseSessionOverviewResponse.dto';

import { CourseSessionResponse } from './dto/CourseSessionResponse.dto';
import { GetCourseAttendantQueryDto } from './dto/GetCourseAttendantQuery.dto';
import { PreBookingCancellationResponse } from './dto/PreBookingCancellationResponse.dto';
import { UserUpcomingBookingsResponse } from './dto/UserUpcomingBookings.dto';
import { CourseSessionValidatePipe } from './pipes/CourseSessionValidatePipe';
import { UserCourseProgressService } from './userCourseProgress.service';

@Controller('v1/course-sessions')
@ApiTags('CourseSessions')
export class CourseSessionController {
  private logger = new Logger(CourseSessionController.name);

  constructor(
    private connection: Connection,
    private readonly courseService: CourseService,
    private readonly courseSessionService: CourseSessionService,
    private readonly userCourseProgressService: UserCourseProgressService,
    private readonly courseCancellationService: CourseSessionCancellationService,
    private readonly courseSessionReportService: CourseSessionReportService,
    private readonly notificationProducer: NotificationProducer,
  ) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    ClassSerializerInterceptor,
    new UserLogInterceptor({
      category: userLogCategory.COURSE_SESSION,
    }),
  )
  @Get('/')
  async getCourseSessions(
    @Query() dto: CourseSessionQueryDto,
    @Req() req: IRequestWithUser,
  ) {
    const response = new BaseResponseDto<CourseSessionResponse[]>();
    const courseSessions = await this.courseSessionService.findCourseSessions(
      dto,
      req.user,
    );

    response.data = courseSessions.map(
      (cs) => new CourseSessionResponse(cs, req.user.id),
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/me')
  async getMyCourseSessions(
    @Query() dto: CourseSessionQueryDto,
    @Req() req: IRequestWithUser,
    @Headers('accept-language') acceptLanguage: LanguageCode,
  ) {
    const response = new BaseResponseDto<{
      active: CourseSessionMe[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cancelled: any[];
    }>();
    const courseSessions = await this.courseSessionService.findCourseSessions(
      dto,
      req.user,
      true,
      true,
    );
    const cancellations =
      await this.courseCancellationService.getUserCancellation(req.user, dto);

    response.data = {
      active: courseSessions.map(
        (cs) => new CourseSessionMe(cs, acceptLanguage),
      ),
      cancelled: cancellations.map((cancellation) => ({
        ...cancellation,
        courseSession: new CourseSessionMe(
          cancellation.courseSession,
          acceptLanguage,
        ),
      })),
    };
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseSessionController.prototype.create),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('')
  async create(@Body() body: CreateCourseSessionBody) {
    const response = new BaseResponseDto<CourseSession>();
    const courseSession = await this.courseSessionService.create(body);

    response.data = courseSession;

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseSessionController.prototype.update),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateCourseSessionBody) {
    await this.courseSessionService.update(id, body);
  }

  // TODO: Cache with Redis
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    ClassSerializerInterceptor,
    new UserLogInterceptor({
      category: userLogCategory.COURSE_SESSION,
    }),
  )
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('/calendar')
  async getCourseSessionCalendar(
    @Query() dto: CourseSessionCalendarQuery,
    @Req() req: IRequestWithUser,
  ) {
    const response = new BaseResponseDto<CourseSessionCalendarResponseDto[]>();
    const sessions =
      await this.courseSessionService.getAllCourseSessionStartDateTime({
        dto,
        user: req.user,
        restrictToInstructorId: dto.instructorId,
        includeCancelled: false,
      });

    response.data = sessions.map(
      (session) => new CourseSessionCalendarResponseDto(session, req.user.id),
    );
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseSessionController.prototype.getCourseSessionAttendance),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CLASS_ATTENDANCE)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('/attendance')
  async getCourseSessionAttendance(
    @Query() dto: CourseSessionCalendarQuery,
    @Request() req: IRequestWithUser & UserPolicies,
  ) {
    const response = new BaseResponseDto<CourseSessionCalendarResponseDto[]>();

    const restrictToInstructor =
      !req.userPolicies.has(
        BACKEND_ADMIN_CONTROL.ACCESS_ALL_CLASS_ATTENDANCE,
      ) && !req.userPolicies.has(GOD_MODE.GRANT_ALL_ACCESS);

    const sessions =
      await this.courseSessionService.getAllCourseSessionStartDateTime({
        dto,
        restrictToInstructorId: restrictToInstructor ? req.user.id : undefined,
        user: req.user,
        includeCancelled: true,
      });

    response.data = sessions.map(
      (session) => new CourseSessionCalendarResponseDto(session),
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/booking/:bookingId')
  async getCourseSessionBooking(
    @Param('bookingId') bookingId: string,
    @Req() req: IRequestWithUser,
    @Headers('Start-Of-Day') startOfToday: string,
    @Headers('End-Of-Range') endOfRange: string,
  ) {
    const response = new BaseResponseDto();

    const booking = await this.courseSessionService.getCourseSessionBookingById(
      bookingId,
      req.user,
    );

    const preRequisiteCourse = await this.courseService.getPreRequisiteCourse(
      booking.courseSession.courseOutline.course,
      req.user,
      startOfToday,
      endOfRange,
    );

    response.data = new CourseSessionBookingResponse(
      booking,
      preRequisiteCourse?.id,
    );

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    ClassSerializerInterceptor,
    new UserLogInterceptor({
      category: userLogCategory.COURSE_SESSION,
      subCategory: userLogSubCategory.BOOK,
    }),
  )
  @Post('/:id/booking')
  async bookingCourseSession(
    @Param('id', CourseSessionValidatePipe) courseSessionId: string,
    @Req() req: IRequestWithUser,
  ) {
    const session = await this.courseSessionService.getSession(
      courseSessionId,
      {
        relations: ['courseOutline'],
      },
    );

    await Promise.all([
      this.courseSessionService.validateSubscription(session, req.user),
      this.courseSessionService.checkPreBookCondition(session, req.user),
      this.courseSessionService.checkBookingTime(session, req.user),
    ]);

    const data = await this.courseSessionService.createCourseSessionBooking(
      courseSessionId,
      req.user,
    );

    this.courseSessionService.sendBookingConfirmationEmail(data.id, req.user);

    const startDateTime = getLanguageFromDate(
      session.startDateTime,
      NOTIFICATION_DATE_FORMAT,
    );

    const endDateTime = getLanguageFromDate(
      session.endDateTime,
      NOTIFICATION_DATE_FORMAT,
    );

    this.notificationProducer
      .notify(
        PushNotificationSubCategoryKey.LEARNING_ACTIVITY_SESSION_BOOKED,
        req.user.id,
        {
          [NV.SESSION_NAME.alias]: session.courseOutline.title,
          [NV.SESSION_END_DATETIME.alias]: endDateTime,
          [NV.SESSION_START_DATETIME.alias]: startDateTime,
        },
      )
      .catch();

    const response = new BaseResponseDto();

    response.data = data;

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    ClassSerializerInterceptor,
    new UserLogInterceptor({
      category: userLogCategory.COURSE_SESSION,
      subCategory: userLogSubCategory.CANCEL_BOOKING,
    }),
  )
  @Delete('/:id/booking')
  async deleteCourseSessionBooking(
    @Param('id', CourseSessionValidatePipe) courseSessionId: string,
    @Req() req: IRequestWithUser,
  ) {
    const [session] = await Promise.all([
      this.courseSessionService.getSession(courseSessionId, {
        relations: ['courseOutline'],
      }),
      this.connection.transaction(async (manager) => {
        await this.courseSessionService
          .withTransaction(manager)
          .deleteCourseSessionBooking({
            courseSessionId,
            student: req.user,
            reason: Reason.CancelledByUser,
          });
      }),
    ]);

    const startDateTime = getLanguageFromDate(
      session.startDateTime,
      NOTIFICATION_DATE_FORMAT,
    );

    const endDateTime = getLanguageFromDate(
      session.endDateTime,
      NOTIFICATION_DATE_FORMAT,
    );

    this.notificationProducer
      .notify(
        PushNotificationSubCategoryKey.LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_USER,
        req.user.id,
        {
          [NV.SESSION_NAME.alias]: session.courseOutline.title,
          [NV.SESSION_END_DATETIME.alias]: endDateTime,
          [NV.SESSION_START_DATETIME.alias]: startDateTime,
        },
      )
      .catch();
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/:id/validate-cancelling-request')
  async validateCancellingRequest(
    @Param('id', CourseSessionValidatePipe) courseSessionId: string,
    @Req() req: IRequestWithUser,
  ) {
    const response = new BaseResponseDto();

    const { courseSession, relatedBookings } =
      await this.courseSessionService.validatePreBookCourseSessionCancelling(
        courseSessionId,
        req.user,
      );

    response.data = new PreBookingCancellationResponse(
      courseSession,
      relatedBookings,
    );

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseSessionController.prototype.bulkUpload),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('bulk-upload')
  async bulkUpload(
    @Body() body: CourseSessionBulkUploadBody,
    @Req() request: IRequestWithUser,
  ) {
    await this.courseSessionService.recordBulkUploadHistory(
      body.metadata,
      request.user,
    );

    this.courseSessionService.bulkUpload(body).catch((error) => {
      this.logger.error(
        'Error while processing bulk upload course sessions.',
        JSON.stringify(error),
      );
    });
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseSessionController.prototype.getBulkUploadHistory),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('bulk-upload-history')
  async getBulkUploadHistory(@Query() query: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const response = new BaseResponseDto<CourseSessionUploadHistory[]>();
    const [data, count] = await this.courseSessionService.getBulkUploadHistory({
      skip,
      take,
      search,
      searchField,
      order,
      orderBy,
    });

    response.data = data;
    response.pagination = getPaginationResponseParams(query, count);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    ClassSerializerInterceptor,
    new UserLogInterceptor({
      category: userLogCategory.COURSE_SESSION,
      subCategory: userLogSubCategory.VALIDATE_BOOKING,
    }),
  )
  @Post(':id/validate-booking-request')
  async validateBookingRequest(
    @Param('id', CourseSessionValidatePipe) courseSessionId: string,
    @Req() req: IRequestWithUser,
  ) {
    const session = await this.courseSessionService.getSession(
      courseSessionId,
      {
        relations: ['courseOutline'],
      },
    );

    await Promise.all([
      this.courseSessionService.validateSubscription(session, req.user),
      this.courseSessionService.checkPreBookCondition(session, req.user),
      this.courseSessionService.checkBookingTime(session, req.user),
    ]);

    const response = new BaseResponseDto<boolean>();
    response.data = true;

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseSessionController.prototype.getCourseSessionAttendance),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CLASS_ATTENDANCE)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id/attendants')
  async getCourseSessionAttendants(@Param('id') id: string) {
    // TODO: guard against user if has access to session
    // if instructor/moderator of that session, allow

    const response = new BaseResponseDto();
    const students = await this.courseSessionService.getStudents(id);
    response.data = students;

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(
      CourseSessionController.prototype.getActiveCourseSessionAttendance,
    ),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CLASS_ATTENDANCE)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id/active-attendants')
  async getActiveCourseSessionAttendance(
    @Param('id') id: string,
    @Query() query: GetCourseAttendantQueryDto,
  ) {
    const response = new BaseResponseDto();
    const { users, count } = await this.courseSessionService.getActiveStudents(
      id,
      query,
    );
    response.data = users;
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseSessionController.prototype.getCancelledUsers),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CLASS_ATTENDANCE)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':sessionId/attendants/cancellations')
  async getCancelledUsers(
    @Param('sessionId') sessionId: string,
    @Query() query: BaseQueryDto,
  ) {
    const response = new BaseResponseDto<UserSessionManagement[]>();
    const { users, count } = await this.courseCancellationService.getAttendants(
      sessionId,
      query,
    );

    response.data = users;

    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseSessionController.prototype.cancelSession),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CLASS_ATTENDANCE)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post(':sessionId/cancellations')
  async cancelSession(
    @Param('sessionId') sessionId: string,
    @Body() dto: CourseSessionCancellationBody,
    @Request() req: IRequestWithUser,
    @Headers('Now') now: string,
  ) {
    await this.connection.transaction(async (manager) => {
      return this.courseCancellationService
        .withTransaction(manager)
        .cancelSession(sessionId, dto, req.user, now);
    });
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseSessionController.prototype.getCourseSessionAttendance),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CLASS_ATTENDANCE)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put('/:id/mark-attendance')
  async markAttendance(
    @Param('id') id: string,
    @Request() req: IRequestWithUser & UserPolicies,
    @Body() body: CourseSessionMarkAttendanceBody,
  ) {
    const session = await this.courseSessionService.getSession(id, {
      relations: [
        'courseOutline',
        'courseSessionInstructor',
        'courseSessionInstructor.instructor',
      ],
    });

    // if user is an instructor level policies,
    // check if user is actually an instructor of the session
    if (
      !req.userPolicies.has(
        BACKEND_ADMIN_CONTROL.ACCESS_ALL_CLASS_ATTENDANCE,
      ) &&
      !req.userPolicies.has(GOD_MODE.GRANT_ALL_ACCESS)
    ) {
      const isUserAnInstructorOfSession = session.courseSessionInstructor.find(
        (csi) => csi.instructor.id === req.user.id,
      );
      if (!isUserAnInstructorOfSession) {
        throw new ForbiddenException(
          'User is not an instructor of the session',
        );
      }
    }

    await Promise.allSettled(
      body.studentIds.map(async (studentId) => {
        await this.connection.transaction(async (manager) => {
          const result = await this.courseSessionService
            .withTransaction(manager, { excluded: [NotificationProducer] })
            .markAttendance(
              id,
              studentId,
              session.courseOutline.id,
              body.status,
            );

          await this.userCourseProgressService
            .withTransaction(manager, { excluded: [NotificationProducer] })
            .recalculateByCourseOutlineAndUserId(
              studentId,
              session.courseOutline.id,
            );

          return result;
        });
      }),
    );

    const response = new BaseResponseDto();
    response.data = true;
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/:id')
  async getCourseSessionById(
    @Param('id') sessionId: string,
    @Headers('accept-language') acceptLanguage: LanguageCode,
  ) {
    const response = new BaseResponseDto<CourseSessionOverviewResponse>();
    const courseSession = await this.courseSessionService.findCourseSessionById(
      sessionId,
    );
    response.data = new CourseSessionOverviewResponse(
      courseSession,
      acceptLanguage,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/bookable-users')
  async getCourseSessionBookableUsers(
    @Param('id') sessionId: string,
    @Query() dto: BaseQueryDto,
  ) {
    const response = new BaseResponseDto<{ id: string; email: string }[]>();
    const { users, count } =
      await this.courseSessionService.getBookableUsersForCourseSession(
        sessionId,
        dto,
      );

    response.data = users;
    response.pagination = getPaginationResponseParams(dto, count);

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':courseId/upcoming/me')
  async getUpcomingBookingsByCourseId(
    @Param('courseId') courseId: string,
    @Req() req: IRequestWithUser,
    @Headers('Accept-Language') acceptLanguage: LanguageCode = LanguageCode.EN,
    @Headers('Now') now: string,
    @Headers('End-Of-Range') endOfRange: string,
  ) {
    const upcomingBookings =
      await this.courseSessionService.findUpcomingBookings(
        courseId,
        req.user.id,
        now,
        endOfRange,
      );

    const response = new BaseResponseDto<UserUpcomingBookingsResponse[]>();
    const data = upcomingBookings.map(
      (booking) => new UserUpcomingBookingsResponse(booking, acceptLanguage),
    );
    response.data = data;
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseSessionController.prototype.addStudentsToSession),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post(':id/students')
  async addStudentsToSession(
    @Param('id') courseSessionId: string,
    @Body() body: AddStudentToSessionDto,
  ) {
    const { studentIds } = body;

    await this.connection.transaction(async (manager) => {
      await this.courseSessionService
        .withTransaction(manager, {
          excluded: [NotificationProducer],
        })
        .addStudentsToSession(courseSessionId, studentIds);
    });

    const session = await this.courseSessionService.getSession(
      courseSessionId,
      {
        relations: ['courseOutline'],
      },
    );

    const startDateTime = getLanguageFromDate(
      session.startDateTime,
      NOTIFICATION_DATE_FORMAT,
    );

    const endDateTime = getLanguageFromDate(
      session.endDateTime,
      NOTIFICATION_DATE_FORMAT,
    );

    studentIds.forEach((studentId) =>
      this.notificationProducer
        .notify(
          PushNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION,
          studentId,
          {
            [NV.SESSION_NAME.alias]: session.courseOutline.title,
            [NV.SESSION_END_DATETIME.alias]: endDateTime,
            [NV.SESSION_START_DATETIME.alias]: startDateTime,
          },
        )
        .catch(),
    );
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseSessionController.prototype.getSessionParticipantsReport),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get(':id/participant-reports')
  async getSessionParticipantsReport(
    @Param('id') sessionId: string,
    @Response() res: ExpressResponse,
  ) {
    const report =
      await this.courseSessionReportService.generateSessionParticipantsReport(
        sessionId,
      );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${report.fileName}`,
    );

    return report.stream.pipe(res);
  }
}
