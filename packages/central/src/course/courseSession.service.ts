import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseAccessCheckerService } from '@seaccentral/core/dist/course/courseAccessCheckerService.service';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import {
  CourseRuleItem,
  CourseRuleType,
} from '@seaccentral/core/dist/course/CourseRuleItem.entity';
import { CourseSession } from '@seaccentral/core/dist/course/CourseSession.entity';
import {
  CourseSessionBooking,
  CourseSessionBookingStatus,
} from '@seaccentral/core/dist/course/CourseSessionBooking.entity';
import { CourseSessionInstructor } from '@seaccentral/core/dist/course/CourseSessionInstructor.entity';
import {
  CourseSessionUploadHistory,
  UploadProcessStatus,
} from '@seaccentral/core/dist/course/CourseSessionUploadHistory.entity';
import { CourseSubCategoryKey } from '@seaccentral/core/dist/course/CourseSubCategory.entity';
import { UserCourseOutlineProgress } from '@seaccentral/core/dist/course/UserCourseOutlineProgress.entity';
import { UserCourseOutlineProgressStatus } from '@seaccentral/core/dist/course/UserCourseOutlineProgressStatus.enum';
import {
  Reason,
  UserCourseSessionCancellationLog,
} from '@seaccentral/core/dist/course/UserCourseSessionCancellationLog.entity';
import { UserEnrolledCourse } from '@seaccentral/core/dist/course/UserEnrolledCourse.entity';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import {
  getPaginationRequestParams,
  getSearchRequestParams,
  getSortRequestParams,
  IListParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { ERROR_CODES } from '@seaccentral/core/dist/error/errors';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { EmailNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/EmailNotificationSubCategory.enum';
import { NotificationService } from '@seaccentral/core/dist/notification/Notification.service';
import { NotificationVariableDict } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import {
  BANGKOK_TIMEZONE,
  DELIMITER_PATTERN,
} from '@seaccentral/core/dist/utils/constants';
import { formatWithTimezone } from '@seaccentral/core/dist/utils/date';
import { generateICScalendar } from '@seaccentral/core/dist/utils/ics';
import { getStringFromLanguage } from '@seaccentral/core/dist/utils/language';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { classToPlain } from 'class-transformer';
import { isAfter, isBefore, isWithinInterval } from 'date-fns';
import { flatten, isEqual, sortBy, uniqBy } from 'lodash';
import {
  Brackets,
  DeepPartial,
  FindOneOptions,
  ILike,
  In,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { CourseService } from './course.service';
import {
  CreateCourseSessionBody,
  UpdateCourseSessionBody,
} from './dto/course-sessions/CourseSession.dto';
import { UserSessionManagement } from './dto/course-sessions/UserSessionManagement.dto';
import {
  CourseSessionBulkUploadBody,
  CourseSessionUploadFile,
} from './dto/CourseSessionBulkUploadBody.dto';
import {
  CourseSessionCalendarQuery,
  CourseSessionCalendarQueryFields,
} from './dto/CourseSessionCalendarQuery.dto';
import { CourseSessionQueryDto } from './dto/CourseSessionQuery.dto';
import { GetCourseAttendantQueryDto } from './dto/GetCourseAttendantQuery.dto';
import { IRawActiveParticipants } from './interface/IRawActiveParticipants';

@Injectable()
export class CourseSessionService extends TransactionFor<CourseSessionService> {
  private readonly logger = new Logger(CourseSessionService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly courseService: CourseService,
    private readonly courseAccessCheckerService: CourseAccessCheckerService,
    private readonly userService: UsersService,
    private readonly notificationProducer: NotificationProducer,
    private readonly notificationService: NotificationService,
    @InjectRepository(CourseOutline)
    private courseOutlineRepository: Repository<CourseOutline>,
    @InjectRepository(CourseSession)
    private courseSessionRepository: Repository<CourseSession>,
    @InjectRepository(CourseSessionInstructor)
    private courseSessionInstructorRepository: Repository<CourseSessionInstructor>,
    @InjectRepository(CourseSessionUploadHistory)
    private courseSessionUploadHistoryRepository: Repository<CourseSessionUploadHistory>,
    @InjectRepository(CourseSessionBooking)
    private courseSessionBookingRepository: Repository<CourseSessionBooking>,
    @InjectRepository(UserCourseOutlineProgress)
    private userCourseOutlineProgressRepository: Repository<UserCourseOutlineProgress>,
    @InjectRepository(CourseRuleItem)
    private courseRuleItemRepository: Repository<CourseRuleItem>,
    @InjectRepository(UserCourseSessionCancellationLog)
    private userCourseSessionCancellationRepository: Repository<UserCourseSessionCancellationLog>,
    @InjectRepository(UserEnrolledCourse)
    private userEnrolledCourseRepository: Repository<UserEnrolledCourse>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async findCourseSessions(
    dto: CourseSessionQueryDto,
    user: User,
    excludeCancelled = true,
    isMe = false,
  ) {
    const {
      courseOutlineId,
      instructorIds,
      language,
      startTime: startTimeString,
      endTime: endTimeString,
    } = dto;

    const query = this.courseSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.courseSessionInstructor', 'csi')
      .leftJoinAndSelect(
        'csi.instructor',
        'instructor',
        'instructor.isActive = :isActive',
      )
      .leftJoinAndSelect('session.courseSessionBooking', 'csb')
      .leftJoinAndSelect(
        'csb.student',
        'student',
        'student.isActive = :isActive',
      )
      .leftJoinAndSelect('session.courseOutline', 'co')
      .leftJoinAndSelect('co.title', 'coTitle')
      .leftJoinAndSelect('co.description', 'coDescription')
      .leftJoinAndSelect('co.course', 'coCourse')
      .leftJoinAndSelect('coCourse.title', 'coCourseTitle')
      .leftJoinAndSelect('co.category', 'coCategory')
      .leftJoinAndSelect('co.learningWay', 'coLearningWay')
      .leftJoinAndSelect('coCourse.courseTopic', 'courseTopic')
      .loadRelationCountAndMap(
        'coCourse.certificateCount',
        'coCourse.certificateRule',
      )
      .leftJoinAndSelect('courseTopic.topic', 'topic')
      .where('session.isActive = :isActive', { isActive: true })
      .addOrderBy('session.startDateTime', 'ASC');

    if (excludeCancelled) {
      query.andWhere('session.cancelled = :cancelled', { cancelled: false });
    }

    if (startTimeString && endTimeString) {
      const startTime = new Date(startTimeString);
      const endTime = new Date(endTimeString);
      query.andWhere('session.startDateTime BETWEEN :startTime AND :endTime', {
        startTime,
        endTime,
      });
    }

    if (courseOutlineId) {
      query.andWhere('session.courseOutlineId = :courseOutlineId', {
        courseOutlineId,
      });
    }

    if (language) {
      query.andWhere('session.language = :language', { language });
    }

    if (!isMe) {
      query
        .loadRelationCountAndMap(
          'userEnrolledCourse.isEnrolled',
          'coCourse.userEnrolledCourse',
          'userEnrolledCourse',
          (qb: SelectQueryBuilder<UserEnrolledCourse>) =>
            qb.where('userEnrolledCourse.userId = :userId', {
              userId: user.id,
            }),
        )
        .andWhere('session.isPrivate = :isPrivate', { isPrivate: false });
    } else {
      query
        .leftJoinAndSelect('coCourse.userEnrolledCourse', 'userEnrolledCourse')
        .leftJoinAndSelect('userEnrolledCourse.user', 'user')
        .andWhere('csb.studentId = :studentId', { studentId: user.id })
        .andWhere('userEnrolledCourse.userId = :userId', {
          userId: user.id,
        });
    }

    let sessions = await query.getMany();

    // Instructor filtering doing outside SQL query to make sure the result include all instructors in the session.
    if (instructorIds && instructorIds.length) {
      sessions = sessions.filter((session) =>
        session.courseSessionInstructor.some((csi) =>
          instructorIds.includes(csi.instructor.id),
        ),
      );
    }

    return sessions;
  }

  async findCourseSessionById(id: string) {
    const session = await this.courseSessionRepository
      .createQueryBuilder('session')
      .innerJoin('session.courseOutline', 'courseOutline')
      .innerJoin('courseOutline.title', 'courseOutlineTitle')
      .innerJoin('courseOutline.category', 'subCategory')
      .innerJoin('courseOutline.course', 'course')
      .innerJoin('session.courseSessionInstructor', 'courseSessionInstructor')
      .innerJoin('courseSessionInstructor.instructor', 'instructor')
      .leftJoinAndSelect('session.courseSessionBooking', 'courseSessionBooking')
      .leftJoinAndSelect('course.title', 'title')
      .select([
        'session',
        'courseOutline.id',
        'courseOutlineTitle',
        'subCategory',
        'course.id',
        'course.imageKey',
        'course.availableLanguage',
        'courseSessionBooking.id',
        'title',
        'courseSessionInstructor.id',
        'instructor.id',
        'instructor.firstName',
        'instructor.lastName',
      ])
      .where('session.id = :id')
      .andWhere('session.isActive = :isActive')
      .setParameters({
        id,
        isActive: true,
      })
      .getOne();

    if (!session) {
      throw new HttpException(
        'Course Session not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    return session;
  }

  async create(body: CreateCourseSessionBody) {
    await this.validateInstructorSession({
      instructorId: body.instructorId,
      startDateTime: body.startDateTime,
      endDateTime: body.endDateTime,
    });

    const courseSessionData = this.courseSessionRepository.create({
      ...body,
      courseOutline: { id: body.courseOutlineId },
      courseSessionInstructor: this.courseSessionInstructorRepository.create([
        { instructor: { id: body.instructorId } },
      ]),
    });

    const courseSession = await this.courseSessionRepository.save(
      courseSessionData,
    );

    return courseSession;
  }

  async update(id: string, body: UpdateCourseSessionBody) {
    const courseSession = await this.courseSessionRepository.findOne(id, {
      relations: ['courseOutline'],
      where: { isActive: true },
    });

    if (!courseSession) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Course session does not exist, id = "${id}"`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.validateInstructorSession(
      {
        instructorId: body.instructorId,
        startDateTime: body.startDateTime,
        endDateTime: body.endDateTime,
      },
      id,
    );
    const courseSessionInstructors =
      await this.courseSessionInstructorRepository.find({
        where: { courseSession: { id } },
      });

    const didStartDateTimeChange =
      new Date(body.startDateTime).getTime() !==
      courseSession.startDateTime.getTime();

    const didInstructorChange =
      body.instructorId !== courseSessionInstructors[0].instructorId;

    await this.courseSessionInstructorRepository.remove(
      courseSessionInstructors,
    );

    const courseSessionData = this.courseSessionRepository.create({
      ...body,
      courseSessionInstructor: this.courseSessionInstructorRepository.create([
        { instructor: { id: body.instructorId } },
      ]),
    });

    const updatedCourseSession = await this.courseSessionRepository.save(
      courseSessionData,
    );

    if (didStartDateTimeChange) {
      this.sendScheduleUpdateEmail(courseSession.startDateTime, id);
    }
    if (didInstructorChange) {
      this.sendInstructorUpdateEmail(
        courseSessionInstructors[0]?.instructor,
        id,
      );
    }

    return updatedCourseSession;
  }

  private async getSessionDetailsForEmail(sessionId: string) {
    const session = await this.courseSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.courseOutline', 'courseOutline')
      .leftJoinAndSelect('courseOutline.title', 'courseOutlineTitle')
      .leftJoinAndSelect('courseOutline.course', 'course')
      .leftJoinAndSelect('course.title', 'courseTitle')
      .leftJoinAndSelect(
        'session.courseSessionInstructor',
        'courseSessionInstructor',
      )
      .leftJoinAndSelect('courseSessionInstructor.instructor', 'instructor')
      .where('session.id = :sessionId', { sessionId })
      .getOne();
    return session;
  }

  private async getSessionBookingsForEmail(session: CourseSession) {
    const bookings = await this.courseSessionBookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect(
        'booking.courseSession',
        'session',
        'session.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'booking.student',
        'student',
        'student.isActive = :isActive',
      )
      .where('session.id = :sessionId')
      .setParameters({
        isActive: true,
        sessionId: session.id,
      })
      .getMany();

    return bookings;
  }

  async sendScheduleUpdateEmail(oldStartDateTime: Date, sessionId: string) {
    const session = await this.getSessionDetailsForEmail(sessionId);

    if (!session) return;

    const { instructor, learner, moderator } =
      await this.notificationService.getEmailReceiverRoles(
        EmailNotificationSubCategoryKey.BOOKING_SCHEDULE_CHANGED,
      );

    const recipients: User[] = [];
    if (instructor) {
      recipients.push(
        ...session.courseSessionInstructor.map((csi) => csi.instructor),
      );
    }
    if (moderator) {
      recipients.push(...(await this.notificationService.getModerators()));
    }
    if (learner) {
      const bookings = await this.getSessionBookingsForEmail(session);
      recipients.push(...bookings.map((booking) => booking.student));
    }

    recipients.forEach((recipient) => {
      if (recipient.email) {
        this.notificationProducer.sendEmail({
          key: EmailNotificationSubCategoryKey.BOOKING_SCHEDULE_CHANGED,
          language: recipient.emailNotificationLanguage,
          to: recipient.email,
          replacements: {
            [NotificationVariableDict.COURSE_NAME.alias]: getStringFromLanguage(
              session.courseOutline.course.title,
              recipient.emailNotificationLanguage,
            ),
            [NotificationVariableDict.SESSION_START_DATE.alias]:
              formatWithTimezone(
                session.startDateTime,
                BANGKOK_TIMEZONE,
                'dd MMM yyyy',
              ),
            [NotificationVariableDict.FULL_NAME.alias]: recipient.fullName,
            [NotificationVariableDict.SESSION_NAME.alias]:
              getStringFromLanguage(
                session.courseOutline.title,
                recipient.emailNotificationLanguage,
              ),
            [NotificationVariableDict.OLD_SESSION_START_DATETIME.alias]:
              formatWithTimezone(
                oldStartDateTime,
                BANGKOK_TIMEZONE,
                'dd MMM yyyy HH:mm',
              ),
            [NotificationVariableDict.SESSION_START_DATETIME.alias]:
              formatWithTimezone(
                session.startDateTime,
                BANGKOK_TIMEZONE,
                'dd MMM yyyy HH:mm',
              ),
            [NotificationVariableDict.SESSION_END_DATETIME.alias]:
              formatWithTimezone(
                session.endDateTime,
                BANGKOK_TIMEZONE,
                'dd MMM yyyy HH:mm',
              ),
            [NotificationVariableDict.INSTRUCTOR_NAME.alias]:
              session.courseSessionInstructor[0]?.instructor?.fullName,
            [NotificationVariableDict.OUTLINE_SCHEDULE_LINK
              .alias]: `${this.configService.get(
              'CLIENT_BASE_URL',
            )}/course-outline/${session.courseOutline.id}/sessions`,
          },
        });
      }
    });
  }

  async sendInstructorUpdateEmail(oldInstructor: User, sessionId: string) {
    const session = await this.getSessionDetailsForEmail(sessionId);

    if (!session) return;

    const { instructor, learner, moderator } =
      await this.notificationService.getEmailReceiverRoles(
        EmailNotificationSubCategoryKey.BOOKING_INSTRUCTOR_CHANGED,
      );

    const recipients: { user: User; bookingId: string | null }[] = [];
    if (instructor) {
      recipients.push(
        { user: oldInstructor, bookingId: null },
        ...session.courseSessionInstructor.map((csi) => ({
          user: csi.instructor,
          bookingId: null,
        })),
      );
    }
    if (moderator) {
      recipients.push(
        ...(await this.notificationService.getModerators()).map((user) => ({
          user,
          bookingId: null,
        })),
      );
    }
    if (learner) {
      const bookings = await this.getSessionBookingsForEmail(session);
      recipients.push(
        ...bookings.map((booking) => ({
          user: booking.student,
          bookingId: booking.id,
        })),
      );
    }

    recipients.forEach(({ user, bookingId }) => {
      if (user.email) {
        this.notificationProducer.sendEmail({
          key: EmailNotificationSubCategoryKey.BOOKING_INSTRUCTOR_CHANGED,
          language: user.emailNotificationLanguage,
          to: user.email,
          replacements: {
            [NotificationVariableDict.COURSE_NAME.alias]: getStringFromLanguage(
              session.courseOutline.course.title,
              user.emailNotificationLanguage,
            ),
            [NotificationVariableDict.SESSION_START_DATE.alias]:
              formatWithTimezone(
                session.startDateTime,
                BANGKOK_TIMEZONE,
                'dd MMM yyyy',
              ),
            [NotificationVariableDict.FULL_NAME.alias]: user.fullName,
            [NotificationVariableDict.SESSION_NAME.alias]:
              getStringFromLanguage(
                session.courseOutline.title,
                user.emailNotificationLanguage,
              ),
            [NotificationVariableDict.SESSION_START_DATETIME.alias]:
              formatWithTimezone(
                session.startDateTime,
                BANGKOK_TIMEZONE,
                'dd MMM yyyy HH:mm',
              ),
            [NotificationVariableDict.SESSION_END_DATETIME.alias]:
              formatWithTimezone(
                session.endDateTime,
                BANGKOK_TIMEZONE,
                'dd MMM yyyy HH:mm',
              ),
            [NotificationVariableDict.INSTRUCTOR_NAME.alias]:
              session.courseSessionInstructor[0]?.instructor?.fullName,
            [NotificationVariableDict.SESSION_WAITING_ROOM_LINK.alias]:
              bookingId
                ? `${this.configService.get(
                    'CLIENT_BASE_URL',
                  )}/dashboard/bookings/${bookingId}`
                : '',
          },
        });
      }
    });
  }

  async getAllCourseSessionStartDateTime({
    dto,
    restrictToInstructorId,
    user,
    includeCancelled,
  }: {
    dto: CourseSessionCalendarQuery;
    restrictToInstructorId?: User['id'];
    user: User;
    includeCancelled: boolean;
  }) {
    const maxMonth = 3;
    const now = new Date();

    // Allow client send local or UTC time by their given date string.
    const minDate = dto.startTime
      ? new Date(dto.startTime)
      : new Date(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0,
          0,
          0,
        );
    const maxDate = dto.endTime
      ? new Date(dto.endTime)
      : new Date(
          now.getUTCFullYear(),
          now.getUTCMonth() + maxMonth,
          now.getUTCDate(),
          23,
          59,
          59,
        );

    const include: { [field in CourseSessionCalendarQueryFields]?: true } = {};

    dto.fields?.forEach((field) => {
      include[field] = true;
    });

    let query = this.courseSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.courseOutline', 'outline')
      .where('session.isActive = :isActive', { isActive: true })
      .andWhere('session.cancelled = :cancelled', { cancelled: false })
      .andWhere('session.isPrivate = :isPrivate', { isPrivate: false })
      .andWhere('session.startDateTime BETWEEN :minDate AND :maxDate', {
        minDate,
        maxDate,
      });

    if (!includeCancelled) {
      query.andWhere('session.cancelled = :cancelled', { cancelled: false });
    }

    if (include.availableSeats || include.isBooked) {
      query = query.leftJoinAndSelect('session.courseSessionBooking', 'csb');
    }

    const shouldCourseBeEnrolled = dto.onlyEnrolled === 'true';

    if (
      include.courseTitle ||
      include.courseImageKey ||
      include.courseTopics ||
      include.hasCertificate ||
      shouldCourseBeEnrolled
    ) {
      query = query.leftJoinAndSelect('outline.course', 'course');

      if (include.hasCertificate) {
        query = query.loadRelationCountAndMap(
          'course.certificateCount',
          'course.certificateRule',
        );
      }

      if (include.courseTitle) {
        query = query.leftJoinAndSelect('course.title', 'courseTitle');
      }

      if (include.courseTopics) {
        query = query
          .leftJoinAndSelect('course.courseTopic', 'courseTopic')
          .leftJoinAndSelect('courseTopic.topic', 'topic');
      }

      if (shouldCourseBeEnrolled) {
        query = query
          .leftJoinAndSelect('course.userEnrolledCourse', 'userEnrolledCourse')
          .leftJoinAndSelect('userEnrolledCourse.user', 'user')
          .andWhere('userEnrolledCourse.userId = :userId', {
            userId: user.id,
          });
      }
    }

    if (include.instructors || restrictToInstructorId) {
      query = query
        .leftJoinAndSelect('session.courseSessionInstructor', 'csi')
        .leftJoinAndSelect('csi.instructor', 'instructor');

      if (restrictToInstructorId) {
        query = query.andWhere('instructor.id = :instructorId', {
          instructorId: restrictToInstructorId,
        });
      }
    }

    if (include.courseOutlineLearningWay) {
      query = query.leftJoinAndSelect('outline.learningWay', 'learningWay');
    }

    if (include.courseOutlineTitle) {
      query = query.leftJoinAndSelect('outline.title', 'outlineTitle');
    }

    if (include.courseOutlineCategory) {
      query = query.leftJoinAndSelect('outline.category', 'outlineCategory');
    }

    if (dto.courseOutlineId) {
      query = query.andWhere('outline.id = :outlineId', {
        outlineId: dto.courseOutlineId,
      });
    }

    query = query.orderBy('session.startDateTime', 'ASC');

    const sessions = await query.getMany();

    return sessions;
  }

  async createCourseSessionBooking(courseSessionId: string, student: User) {
    const isPrivateCourseSession = await this.isPrivateCourseSession(
      courseSessionId,
    );
    if (isPrivateCourseSession)
      throw new HttpException(
        {
          code: ERROR_CODES.CANNOT_CANCEL_PRIVATE_COURSE_SESSION,
        },
        HttpStatus.FORBIDDEN,
      );

    const isBookingExists = await this.isExistsCourseSessionBooking(
      courseSessionId,
      student,
    );
    if (isBookingExists)
      throw new HttpException(
        {
          code: 'USER_ALREADY_BOOKED',
        },
        HttpStatus.CONFLICT,
      );

    const hasAvailableSeats = await this.hasAvailableSeats(courseSessionId);
    if (!hasAvailableSeats)
      throw new HttpException(
        {
          code: 'NO_AVAILABLE_SEATS',
        },
        HttpStatus.BAD_REQUEST,
      );

    return this.courseSessionBookingRepository.save({
      courseSession: { id: courseSessionId },
      student,
      isActive: true,
    });
  }

  async validatePreBookCourseSessionCancelling(
    courseSessionId: string,
    student: User,
  ) {
    const isBookingExists = await this.isExistsCourseSessionBooking(
      courseSessionId,
      student,
    );

    if (!isBookingExists)
      throw new HttpException(
        'There is no booking to delete.',
        HttpStatus.NOT_FOUND,
      );

    const courseSession = await this.courseSessionRepository
      .createQueryBuilder('session')
      .innerJoinAndSelect(
        'session.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'courseOutline.course',
        'course',
        'course.isActive = :isActive',
      )
      .where('session.id = :courseSessionId')
      .andWhere('session.isActive = :isActive')
      .setParameters({
        courseSessionId,
        isActive: true,
      })
      .select(['session', 'courseOutline', 'course.imageKey'])
      .getOneOrFail();

    // Find all booked sessions that has the same outlineID as the cancelling one
    const sameOutlineBookings = await this.findSameOutlineBookedSessions(
      courseSession,
      student,
    );

    let sessionsToDelete: Record<CourseSession['id'], CourseSession[]> = {};

    await Promise.all(
      sameOutlineBookings.map(async (csb) => {
        // Find sessions that needs to be cancelled based on pre-booking rule.
        const relatedSessions = await this.getRelatedSessionsByRuleItems(
          csb.courseSession.courseOutline.id,
          true,
          student,
          csb.courseSession,
        );

        sessionsToDelete = {
          ...sessionsToDelete,
          [csb.courseSession.id]: relatedSessions,
        };
      }),
    );

    // Find one session that has least affected on calcellation (least bookings cancelled)
    const leastRemoveSession = sortBy(
      sessionsToDelete,
      (item) => item.length,
    )[0];

    let bookingsToBeRemoved: CourseSession[] = [];

    /*
      IDEA
       1.Find all session bookings that has the same outline 
       2.Get affected booked sessions for each booked session
       3.Find one session that has the least bookings cancelled (A)
       4.Find which session is distinct between (A) and the cancelling session
       5.The result of 4. will be the affect booked sessions of the cancelling session

       {
          A: [.....]
          B: [.......] (Target) => B - C = [....] is the booked session needs to be cancelled (The other [...] still valid for C)
          C: [...]
       }

       Ref: https://github.com/oozou/seac-central/pull/650
    */
    if (Object.keys(sessionsToDelete).length > 1)
      bookingsToBeRemoved = sessionsToDelete[courseSession.id].filter(
        (sessionA) =>
          !leastRemoveSession.some((sessionB) => sessionA.id === sessionB.id),
      );
    // In case where there is no other same outline bookings to compare
    else bookingsToBeRemoved = sessionsToDelete[courseSession.id];

    return {
      courseSession,
      relatedBookings: sortBy(
        bookingsToBeRemoved,
        (cs) => cs.courseOutline.part,
      ),
    };
  }

  private async findSameOutlineBookedSessions(
    courseSession: CourseSession,
    student: User,
  ) {
    const sameOutlineBookedSessionsBuilder = this.courseSessionBookingRepository
      .createQueryBuilder('booking')
      .innerJoinAndSelect(
        'booking.courseSession',
        'courseSession',
        'courseSession.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'courseSession.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive AND courseOutline.id = :outlineId',
      )
      .innerJoinAndSelect('courseOutline.title', 'title')
      .where('booking.status = :bookingStatus')
      .andWhere('booking.studentId = :studentId')
      .setParameters({
        isActive: true,
        bookingStatus: CourseSessionBookingStatus.NO_MARK,
        outlineId: courseSession.courseOutline.id,
        studentId: student.id,
        targetSessionDateTime: courseSession.endDateTime,
      })
      .select(['booking.id', 'courseSession', 'courseOutline', 'title'])
      .orderBy('courseOutline.part', 'ASC');

    return sameOutlineBookedSessionsBuilder.getMany();
  }

  private async getRelatedSessionsByRuleItems(
    outlineId: string,
    isInitCall = false,
    student: User,
    targetCourseSession: CourseSession,
    courseRuleItems: CourseRuleItem[] = [],
    sessions: CourseSession[] = [],
  ): Promise<CourseSession[]> {
    const appliedForOutlineSessions = flatten(
      courseRuleItems?.map((cri) => cri.appliedFor),
    );

    const newCourseRuleItems = await this.courseRuleItemRepository
      .createQueryBuilder('cri')
      .innerJoinAndSelect(
        'cri.appliedBy',
        'outline',
        'outline.id IN (:...outlineIds)',
      )
      .innerJoinAndSelect('cri.appliedFor', 'appliedFor')
      .innerJoinAndSelect(
        'appliedFor.courseSession',
        'session',
        'session.isActive = :isActive AND session.endDateTime > :currentDateTime AND session.startDateTime > :targetSessionEndDateTime',
      )
      .innerJoinAndSelect(
        'session.courseSessionBooking',
        'booking',
        'booking.studentId = :studentId AND booking.isActive = :isActive AND booking.status = :bookingStatus',
      )
      .innerJoinAndSelect(
        'session.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
      )
      .innerJoinAndSelect('courseOutline.title', 'title')
      .where('cri.type = :type')
      .andWhere('cri.isActive = :isActive')
      .setParameters({
        outlineIds: isInitCall
          ? [outlineId]
          : appliedForOutlineSessions.reduce((ids: string[], co) => {
              if (co.id !== outlineId) ids.push(co.id);
              return ids;
            }, []),
        type: CourseRuleType.BOOK,
        isActive: true,
        targetSessionEndDateTime: targetCourseSession.endDateTime,
        currentDateTime: new Date().toISOString(),
        studentId: student.id,
        bookingStatus: CourseSessionBookingStatus.NO_MARK,
      })
      .getMany();

    const newSessions = uniqBy(
      sessions.concat(
        flatten(courseRuleItems.map((cri) => cri.appliedFor.courseSession)),
      ),
      (s) => s.id,
    );

    if (
      newCourseRuleItems.length === 0 ||
      (isEqual(
        sessions.sort((a, b) => (a.id > b.id ? 1 : -1)),
        newSessions.sort((a, b) => (a.id > b.id ? 1 : -1)),
      ) &&
        sessions.length > 0) // Circular Deps. terminate condition
    )
      return newSessions;

    return this.getRelatedSessionsByRuleItems(
      outlineId,
      false,
      student,
      targetCourseSession,
      newCourseRuleItems,
      newSessions,
    );
  }

  async deleteCourseSessionBooking(params: {
    courseSessionId: string;
    student: User;
    cancelledByUser?: User;
    reason?: Reason;
  }) {
    const { courseSessionId, student, cancelledByUser, reason } = params;
    const { relatedBookings } =
      await this.validatePreBookCourseSessionCancelling(
        courseSessionId,
        student,
      );

    const sessionIdsToDelete = [
      courseSessionId,
      ...relatedBookings.map((rb) => rb.id),
    ];

    if (
      reason === Reason.CancelledByUser ||
      reason === Reason.CancelledSession
    ) {
      const [session, booking] = await Promise.all([
        this.getSession(courseSessionId, {
          relations: [
            'courseSessionInstructor',
            'courseSessionInstructor.instructor',
            'courseOutline',
            'courseOutline.title',
          ],
        }),
        this.courseSessionBookingRepository.findOne({
          where: {
            studentId: student.id,
          },
        }),
      ]);
      const emailNotificationKey =
        reason === Reason.CancelledByUser
          ? EmailNotificationSubCategoryKey.BOOKING_CANCELLATION
          : EmailNotificationSubCategoryKey.BOOKING_CANCELLATION_BY_ADMIN;
      const receiverRoles =
        await this.notificationService.getEmailReceiverRoles(
          emailNotificationKey,
        );

      if (booking && session) {
        if (receiverRoles.learner) {
          if (reason === Reason.CancelledByUser) {
            this.sendBookingCancellationEmail(student, session, booking);
          }
          if (reason === Reason.CancelledSession) {
            this.sendSessionCancellationEmail(student, session);
          }
        }
      }
    }

    await Promise.all([
      this.courseSessionBookingRepository.delete({
        courseSession: { id: In(sessionIdsToDelete) },
        student,
      }),
      this.userCourseSessionCancellationRepository.save(
        sessionIdsToDelete.map((sid) => ({
          user: student,
          courseSession: {
            id: sid,
          },
          cancelledByUser: cancelledByUser || student,
          reason,
        })),
      ),
    ]);
  }

  async sendSessionCancellationEmail(user: User, session: CourseSession) {
    if (user.email) {
      this.notificationProducer.sendEmail({
        key: EmailNotificationSubCategoryKey.BOOKING_CANCELLATION_BY_ADMIN,
        language: user.emailNotificationLanguage,
        to: user.email,
        replacements: {
          [NotificationVariableDict.SESSION_NAME.alias]: getStringFromLanguage(
            session.courseOutline.title,
            user.emailNotificationLanguage,
          ),
          [NotificationVariableDict.SESSION_START_DATE.alias]:
            formatWithTimezone(
              session.startDateTime,
              BANGKOK_TIMEZONE,
              'dd MMM yyyy',
            ),
          [NotificationVariableDict.SESSION_START_DATETIME.alias]:
            formatWithTimezone(
              session.startDateTime,
              BANGKOK_TIMEZONE,
              'dd MMM yyyy HH:mm',
            ),
          [NotificationVariableDict.FULL_NAME.alias]: user.fullName,
          [NotificationVariableDict.INSTRUCTOR_NAME.alias]:
            session.courseSessionInstructor?.[0]?.instructor?.fullName,
          [NotificationVariableDict.SESSION_CANCELLED_DATETIME.alias]:
            formatWithTimezone(new Date()),
        },
      });
    }
  }

  async sendBookingCancellationEmail(
    user: User,
    session: CourseSession,
    booking: CourseSessionBooking,
  ) {
    if (user.email) {
      this.notificationProducer.sendEmail({
        key: EmailNotificationSubCategoryKey.BOOKING_CANCELLATION,
        language: user.emailNotificationLanguage,
        to: user.email,
        replacements: {
          [NotificationVariableDict.SESSION_NAME.alias]: getStringFromLanguage(
            session.courseOutline.title,
            user.emailNotificationLanguage,
          ),
          [NotificationVariableDict.SESSION_START_DATE.alias]:
            formatWithTimezone(
              session.startDateTime,
              BANGKOK_TIMEZONE,
              'dd MMM yyyy',
            ),
          [NotificationVariableDict.SESSION_START_DATETIME.alias]:
            formatWithTimezone(
              session.startDateTime,
              BANGKOK_TIMEZONE,
              'dd MMM yyyy HH:mm',
            ),
          [NotificationVariableDict.FULL_NAME.alias]: user.fullName,
          [NotificationVariableDict.INSTRUCTOR_NAME.alias]:
            session.courseSessionInstructor?.[0]?.instructor?.fullName,
          [NotificationVariableDict.SESSION_REGISTERED_DATETIME.alias]:
            formatWithTimezone(
              booking.createdAt,
              BANGKOK_TIMEZONE,
              'dd MMM yyyy HH:mm',
            ),
          [NotificationVariableDict.SESSION_CANCELLED_DATETIME.alias]:
            formatWithTimezone(
              new Date(),
              BANGKOK_TIMEZONE,
              'dd MMM yyyy HH:mm',
            ),
        },
      });
    }
  }

  async bulkUpload(courseSessionBulkUploadBody: CourseSessionBulkUploadBody) {
    const courseSessionUploadHistory =
      await this.courseSessionUploadHistoryRepository.findOne({
        s3key: courseSessionBulkUploadBody.metadata.key,
      });

    if (!courseSessionUploadHistory) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Cannot find bulk upload history record.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const uniqueCourseOutlineIds = [
        ...new Set(
          courseSessionBulkUploadBody.courseSessions.map(
            (cs) => cs.courseOutlineId,
          ),
        ),
      ];
      const validCourseOutlines = await this.courseOutlineRepository
        .createQueryBuilder('co')
        .leftJoin('co.category', 'category')
        .where('co.id IN (:...courseOutlineIds)', {
          courseOutlineIds: uniqueCourseOutlineIds,
        })
        .andWhere(
          new Brackets((qb) => {
            qb.where('category.key = :categoryKeyVir', {
              categoryKeyVir: CourseSubCategoryKey.VIRTUAL,
            });
            qb.orWhere('category.key = :categoryKeyF2F', {
              categoryKeyF2F: CourseSubCategoryKey.FACE_TO_FACE,
            });
          }),
        )
        .select('co.id', 'id')
        .getRawMany<{ id: string }>();

      const validCourseOutlineIds = validCourseOutlines.map((co) => co.id);

      if (!validCourseOutlineIds.length) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Course outlines are not valid',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const validCourseSessions =
        courseSessionBulkUploadBody.courseSessions.filter((cs) =>
          validCourseOutlineIds.includes(cs.courseOutlineId),
        );

      const courseSessionsToCreate = this.courseSessionRepository.create(
        validCourseSessions.map((cs) => ({
          courseOutline: { id: cs.courseOutlineId },
          startDateTime: cs.startDateTime,
          endDateTime: cs.endDateTime,
          seats: cs.seats,
          webinarTool: cs.webinarTool,
          location: cs.location,
          participantUrl: cs.participantUrl,
          language: cs.language,
          courseSessionInstructor:
            this.courseSessionInstructorRepository.create(
              cs.instructorsIds.map((id) => ({
                instructor: { id },
              })),
            ),
          isPrivate: cs.isPrivate,
        })),
      );

      await this.courseSessionRepository.save(courseSessionsToCreate);

      courseSessionUploadHistory.isProcessed = true;
      courseSessionUploadHistory.status = UploadProcessStatus.COMPLETED;
    } catch (error) {
      courseSessionUploadHistory.error =
        error.response?.error || JSON.stringify(error);
      courseSessionUploadHistory.status = UploadProcessStatus.FAILED;
      throw error;
    } finally {
      this.courseSessionUploadHistoryRepository.save(
        courseSessionUploadHistory,
      );
    }
  }

  async recordBulkUploadHistory(
    uploadFileDto: CourseSessionUploadFile,
    user: User,
  ) {
    const history = this.courseSessionUploadHistoryRepository.create({
      file: uploadFileDto.fileName,
      uploadedBy: user,
      status: UploadProcessStatus.PENDING,
      s3key: uploadFileDto.key,
    });

    await this.courseSessionUploadHistoryRepository.save(history);
  }

  async getBulkUploadHistory(query: IListParams) {
    const searchField = query.searchField
      ? { [query.searchField]: ILike(`%${query.search}%`) }
      : {};
    const orderByField = query.orderBy ? { [query.orderBy]: query.order } : {};

    const result = await this.courseSessionUploadHistoryRepository.findAndCount(
      {
        where: {
          ...searchField,
          isActive: true,
        },
        take: query.take,
        skip: query.skip,
        order: {
          ...orderByField,
        },
        relations: ['uploadedBy'],
      },
    );

    return result;
  }

  async getCourseSessionBookingById(id: string, user: User) {
    const courseSessionBooking =
      await this.courseSessionBookingRepository.findOne({
        where: { id, student: { id: user.id } },
      });

    if (!courseSessionBooking) throw new NotFoundException('Booking not found');

    return this.courseSessionBookingRepository
      .createQueryBuilder('booking')
      .innerJoin('booking.courseSession', 'courseSession')
      .leftJoin('courseSession.courseSessionInstructor', 'csi')
      .leftJoin(
        'csi.instructor',
        'instructor',
        'instructor.isActive = :isActive',
      )
      .leftJoin('courseSession.courseOutline', 'courseOutline')
      .leftJoin('courseOutline.category', 'category')
      .leftJoin('courseOutline.course', 'course')
      .leftJoin('courseOutline.title', 'title')
      .leftJoin('courseOutline.description', 'description')
      .leftJoin(
        'course.courseOutline',
        'subCourseOutline',
        'subCourseOutline.isActive = :isActive',
      )
      .where('booking.courseSession = :courseSessionId')
      .andWhere('booking.studentId = :studentId')
      .andWhere('booking.isActive = :isActive')
      .setParameters({
        courseSessionId: courseSessionBooking.courseSession.id,
        studentId: user.id,
        isActive: true,
      })
      .select([
        'booking.id',
        'courseSession',
        'courseOutline.courseId',
        'course',
        'subCourseOutline.id',
        'category',
        'title',
        'description',
        'csi',
        'instructor',
      ])
      .getOneOrFail();
  }

  async sendBookingConfirmationEmail(
    courseSessionBookingId: string,
    student: User,
  ) {
    const courseSessionBooking = await this.getCourseSessionBookingById(
      courseSessionBookingId,
      student,
    );

    const { courseSession } = courseSessionBooking;
    const {
      courseOutline,
      courseSessionInstructor,
      location,
      startDateTime,
      endDateTime,
    } = courseSession;

    const courseDetail = await this.courseService.findById(
      courseOutline.courseId,
    );

    let ICS: string | null = null;

    try {
      ICS = await this.generateBookingConfirmationICS(
        courseSession,
        student.emailNotificationLanguage,
      );
    } catch (e) {
      this.logger.error(
        'Error generating booking session ICS file',
        JSON.stringify(e),
      );
    }

    try {
      await this.notificationProducer.sendEmail({
        key:
          courseSession.courseOutline.category.key ===
          CourseSubCategoryKey.VIRTUAL
            ? EmailNotificationSubCategoryKey.BOOKING_CONFIRMATION_VIRTUAL
            : EmailNotificationSubCategoryKey.BOOKING_CONFIRMATION_F2F,
        to: student.email as string,
        language: student.emailNotificationLanguage,
        options: ICS
          ? {
              icalEvent: {
                filename: 'invite.ics',
                method: 'publish',
                content: ICS,
              },
            }
          : undefined,
        replacements: {
          [NotificationVariableDict.SESSION_NAME.alias]: getStringFromLanguage(
            courseOutline.title,
            student.emailNotificationLanguage,
          ),
          [NotificationVariableDict.FULL_NAME.alias]: student.fullName,
          [NotificationVariableDict.SESSION_START_DATETIME.alias]:
            formatWithTimezone(
              startDateTime,
              BANGKOK_TIMEZONE,
              'dd MMM yyyy HH:mm',
            ),
          [NotificationVariableDict.SESSION_END_DATETIME.alias]:
            formatWithTimezone(
              endDateTime,
              BANGKOK_TIMEZONE,
              'dd MMM yyyy HH:mm',
            ),
          [NotificationVariableDict.INSTRUCTOR_NAME.alias]:
            courseSessionInstructor
              .map((csi) => csi.instructor.fullName)
              .join(', '),
          [NotificationVariableDict.SESSION_WAITING_ROOM_LINK
            .alias]: `${this.configService.get(
            'CLIENT_BASE_URL',
          )}/dashboard/bookings/${courseSessionBooking.id}`,
          [NotificationVariableDict.LOCATION_NAME.alias]: location,
          [NotificationVariableDict.COURSE_DETAIL_LINK
            .alias]: `${this.configService.get(
            'CLIENT_BASE_URL',
          )}/course-detail/${courseDetail.id}`,
        },
      });
    } catch (e) {
      this.logger.error(
        'Error sending booking confirmation email',
        JSON.stringify(e),
      );
    }
  }

  async isExistsCourseSession(id: string) {
    const count = await this.courseSessionRepository.count({ id });
    return count > 0;
  }

  private async isPrivateCourseSession(id: string) {
    const found = await this.courseSessionRepository.findOne({
      where: {
        id,
      },
      select: ['isPrivate'],
    });
    return found?.isPrivate || false;
  }

  private async isExistsCourseSessionBooking(
    courseSessionId: string,
    student: { id: User['id'] },
  ) {
    const found = await this.courseSessionBookingRepository.count({
      where: {
        courseSession: { id: courseSessionId },
        student,
      },
    });
    return found > 0;
  }

  private async hasAvailableSeats(courseSessionId: string) {
    const bookedSeats = await this.courseSessionBookingRepository.count({
      courseSession: { id: courseSessionId },
    });
    const session = await this.courseSessionRepository.findOne({
      where: { id: courseSessionId },
      select: ['seats'],
    });
    const totalSeats = session?.seats || 0;
    return totalSeats - bookedSeats > 0;
  }

  /**
   * Get start and ending time of given date object.
   * @param d Any given date object
   * @returns object contain startTime and endTime field which represent time during given date.
   */
  private getTimeRangeForSingleDate(d: Date) {
    const startTime = new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      0,
      0,
      0,
    );
    const endTime = new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      23,
      59,
      59,
    );
    return { startTime, endTime };
  }

  private async generateBookingConfirmationICS(
    courseSession: CourseSession,
    acceptLanguage: LanguageCode,
  ) {
    const { courseOutline } = courseSession;
    const {
      startDateTime,
      endDateTime,
      location,
      participantUrl,
      courseSessionInstructor: csi,
    } = courseSession;

    return generateICScalendar(startDateTime, endDateTime, {
      title: getStringFromLanguage(courseOutline.title, acceptLanguage),
      description: getStringFromLanguage(
        courseOutline.description,
        acceptLanguage,
      ),
      ...(location && { location }),
      ...(participantUrl && { url: participantUrl }),
      ...(csi[0] && {
        organizer: {
          name: `${csi[0].instructor.firstName} ${csi[0].instructor.lastName}`,
          email: csi[0].instructor.email,
        },
      }),
    });
  }

  async getSession(
    courseSessionId: string,
    options: FindOneOptions<CourseSession> = {},
    includeCancelled = false,
  ) {
    const session = await this.courseSessionRepository.findOne({
      ...options,
      join: {
        alias: 'cs',
      },
      where: (qb: SelectQueryBuilder<CourseSession>) => {
        qb.where('cs.id = :id', { id: courseSessionId });

        if (!includeCancelled) {
          qb.andWhere('cs.cancelled = :cancelled', { cancelled: false });
        }
      },
    });

    if (!session) {
      throw new NotFoundException('Course session not found');
    }

    return session;
  }

  async validateSubscription(session: CourseSession, user: User) {
    const cheapestPlan = await this.courseAccessCheckerService.getCheapestPlan([
      session.courseOutline.id,
    ]);

    if (!cheapestPlan) return session;

    const subscriptions = await this.courseAccessCheckerService
      .getCourseBundleSubscriptionPlanBuilder(user, [session.courseOutline.id])
      .getMany();

    const eligibleSubscription = subscriptions.find((subscription) => {
      return (
        isAfter(session.startDateTime, subscription.startDate) &&
        isBefore(session.endDateTime, subscription.endDate)
      );
    });

    if (subscriptions.length === 0 || !eligibleSubscription) {
      // Check if there's any direct access given to the user.
      const hasDirectAccess = await this.courseAccessCheckerService
        .hasDirectAccess(session.courseOutline.courseId, user.id)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch((error) => {
          // Silence error for now
        });

      if (hasDirectAccess) return session;
    }

    if (subscriptions.length === 0) {
      const canUpgrade = await this.userService.checkCanUpgradePlan(user);

      throw new ForbiddenException({
        ...ERROR_CODES.INVALID_SUBSCRIPTION,
        data: {
          cheapestPlan: { name: cheapestPlan.name, id: cheapestPlan.id },
          canUpgrade,
        },
      });
    }

    if (!eligibleSubscription) {
      throw new ForbiddenException(ERROR_CODES.SUBSCRIPTION_WILL_EXPIRE);
    }

    return session;
  }

  async checkPreBookCondition(session: CourseSession, user: User) {
    const courseRuleItems = await this.courseRuleItemRepository.find({
      where: {
        appliedFor: { id: session.courseOutline.id },
        type: CourseRuleType.BOOK,
        isActive: true,
      },
      relations: ['appliedBy', 'appliedBy.courseSession'],
    });

    // 1. Pass: if no rules.
    if (courseRuleItems.length < 1) {
      return;
    }

    const appliedByOutlineSessions = flatten(
      courseRuleItems.map((cri) => cri.appliedBy.courseSession),
    );

    const userBookings = await this.courseSessionBookingRepository.find({
      where: {
        studentId: user.id,
        courseSession: {
          id: In(appliedByOutlineSessions.map((abos) => abos.id)),
        },
      },
      loadEagerRelations: false,
      relations: ['courseSession', 'courseSession.courseOutline'],
    });

    // 2. Fail: if there's no booking made for course outline to be pre-booked
    if (userBookings.length < 1) {
      throw new ForbiddenException({
        ...ERROR_CODES.PREVIOUS_OUTLINE_NOT_BOOKED,
        data: courseRuleItems[0].appliedBy,
      });
    }

    // Get attened session outline or ones that are booked before current sessions
    const validCourseOutlineIds = userBookings
      .filter(
        (ub) =>
          ub.status === CourseSessionBookingStatus.ATTENDED ||
          (new Date(ub.courseSession.startDateTime) <
            new Date(session.startDateTime) &&
            new Date(ub.courseSession.endDateTime) <
              new Date(session.startDateTime)),
      )
      .map((ub) => ub.courseSession.courseOutline.id);

    const remainingRuleOutlines = courseRuleItems
      .map((cri) => cri.appliedBy)
      .filter((co) => validCourseOutlineIds.indexOf(co.id) < 0);

    // 3. Pass: all the bookings are completed or if they are in the past time then current booking
    if (remainingRuleOutlines.length < 1) {
      return;
    }

    // 4. Fail
    throw new ForbiddenException({
      ...ERROR_CODES.SESSION_BOOKING_NOT_ALLOWED_BEFORE_PRE_BOOKING,
      data: remainingRuleOutlines[0],
    });
  }

  async checkBookingTime(session: CourseSession, user: User) {
    const courseSessionBookings =
      await this.courseSessionBookingRepository.find({
        join: {
          alias: 'cs',
          leftJoin: {
            courseSession: 'cs.courseSession',
          },
        },
        where: {
          studentId: user.id,
          courseSession: {
            endDateTime: MoreThanOrEqual(new Date().toISOString()),
          },
        },
        loadEagerRelations: false,
        relations: [
          'courseSession',
          'courseSession.courseOutline',
          'courseSession.courseOutline.course',
        ],
      });

    if (!courseSessionBookings.length) return;

    /**
     * Possible overlap timeline
     * case 1
     *  *-----* My current booking
     *    *-* To Book
     *
     * case 2
     *   *--*
     *  *-----*
     *
     * case 3
     *  *--*
     *    *----*
     *
     * case 4
     *  *---*
     * *--*
     */
    const overlapSession = courseSessionBookings.find((csb) => {
      if (
        isWithinInterval(new Date(session.startDateTime), {
          start: new Date(csb.courseSession.startDateTime),
          end: new Date(csb.courseSession.endDateTime),
        })
      ) {
        return true;
      }

      if (
        isWithinInterval(new Date(session.endDateTime), {
          start: new Date(csb.courseSession.startDateTime),
          end: new Date(csb.courseSession.endDateTime),
        })
      ) {
        return true;
      }

      if (
        isWithinInterval(new Date(csb.courseSession.startDateTime), {
          start: new Date(session.startDateTime),
          end: new Date(session.endDateTime),
        })
      ) {
        return true;
      }

      if (
        isWithinInterval(new Date(csb.courseSession.endDateTime), {
          start: new Date(session.startDateTime),
          end: new Date(session.endDateTime),
        })
      ) {
        return true;
      }

      return false;
    });

    if (overlapSession) {
      throw new ForbiddenException({
        ...ERROR_CODES.SESSION_BOOKING_OVERLAP,
        data: {
          session,
          overlapSession,
        },
      });
    }
  }

  async getStudents(sessionId: string) {
    const query = this.courseSessionBookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect(
        'booking.courseSession',
        'session',
        'session.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'booking.student',
        'student',
        'student.isActive = :isActive',
      )
      .where('session.id = :sessionId')
      .setParameters({
        isActive: true,
        sessionId,
      });

    const bookings = await query.getMany();

    return bookings.map((booking) => {
      const { id, firstName, lastName, email } = booking.student;

      return {
        id,
        firstName,
        lastName,
        email,
        bookingStatus: booking.status,
      };
    });
  }

  async getActiveStudents(sessionId: string, dto: GetCourseAttendantQueryDto) {
    const { skip, take } = getPaginationRequestParams(dto);
    const { order, orderBy } = getSortRequestParams(dto);

    const query = this.courseSessionBookingRepository
      .createQueryBuilder('booking')
      .where('booking.courseSessionId = :sessionId')
      .leftJoinAndMapOne(
        'subscriptionQuery',
        (qb) =>
          qb
            .from(Subscription, 's')
            .select('s."userId"', 'userId')
            .addSelect('MIN(s.endDate)', 'expiryDate')
            .where('s.isActive = :isActive', { isActive: true })
            .andWhere('s.endDate > NOW()')
            .addGroupBy('s."userId"'),
        'subscription',
        'subscription."userId" = booking.studentId',
      )
      .setParameters({
        sessionId,
      });

    if (orderBy === 'expiryDate') {
      query.orderBy('subscription."expiryDate"', order);
    }

    const raw = await query
      .limit(take)
      .offset(skip)
      .getRawMany<IRawActiveParticipants>();

    if (raw.length <= 0)
      return {
        users: [],
        count: 0,
      };

    const count = await query.getCount();

    const userEntities = await this.userRepository.find({
      join: {
        alias: 'user',
        leftJoin: {
          organizationUser: 'user.organizationUser',
          organization: 'organizationUser.organization',
        },
      },
      relations: ['organizationUser', 'organizationUser.organization'],
      where: (qb: SelectQueryBuilder<User>) => {
        qb.where('user.id IN (:...ids)').setParameters({
          ids: raw.map((r) => r.booking_studentId),
        });

        if (orderBy === 'name') {
          qb.addOrderBy('user.firstName', order).addOrderBy(
            'user.lastName',
            order,
          );
        } else if (orderBy === 'organization') {
          qb.addOrderBy('organization.name', order);
        } else if (orderBy === 'email') {
          qb.addOrderBy('user.email', order);
        } else if (orderBy === 'phoneNumber') {
          qb.addOrderBy('user.phoneNumber', order);
        }
      },
    });

    const users = classToPlain<UserSessionManagement>(
      orderBy === 'expiryDate'
        ? raw.map(
            (r) =>
              new UserSessionManagement(
                userEntities.find(
                  (user) => user.id === r.booking_studentId,
                ) as User,
                r,
              ),
          )
        : userEntities.map(
            (user) =>
              new UserSessionManagement(
                user,
                raw.find((r) => r.booking_studentId === user.id),
              ),
          ),
    ) as UserSessionManagement[];

    return { users, count };
  }

  async markAttendance(
    sessionId: string,
    studentId: string,
    courseOutlineId: string,
    status: CourseSessionBookingStatus,
  ) {
    const booking = await this.courseSessionBookingRepository.findOne({
      courseSessionId: sessionId,
      studentId,
    });

    if (!booking) {
      throw new NotFoundException(
        'Student does not have a booking for this session',
      );
    }

    await this.courseSessionBookingRepository.update(
      { id: booking.id },
      { status },
    );

    const progress = await this.userCourseOutlineProgressRepository.findOne({
      user: { id: studentId },
      courseOutline: { id: courseOutlineId },
    });

    const progressDelta: DeepPartial<UserCourseOutlineProgress> = {
      status:
        status === CourseSessionBookingStatus.ATTENDED
          ? UserCourseOutlineProgressStatus.COMPLETED
          : UserCourseOutlineProgressStatus.ENROLLED,
      percentage: status === CourseSessionBookingStatus.ATTENDED ? 100 : 0,
    };

    if (progress) {
      await this.userCourseOutlineProgressRepository.update(
        { id: progress.id },
        progressDelta,
      );
    } else {
      await this.userCourseOutlineProgressRepository.save({
        user: { id: studentId },
        courseOutline: { id: courseOutlineId },
        ...progressDelta,
      });
    }

    return true;
  }

  async findUpcomingBookings(
    courseId: string,
    studentId: string,
    now: string,
    endOfRange: string,
  ) {
    const bookings = await this.courseSessionBookingRepository
      .createQueryBuilder('csb')
      .innerJoinAndSelect(
        'csb.courseSession',
        'cs',
        'cs.isActive = :isActive AND cs.startDateTime >= :now AND cs.startDateTime <= :endOfRange AND cs.cancelled = :cancelled',
      )
      .leftJoinAndSelect('cs.courseOutline', 'co', 'co.courseId = :courseId')
      .innerJoinAndSelect('co.title', 'title')
      .where('csb.studentId = :studentId')
      .setParameters({
        courseId,
        studentId,
        isActive: true,
        now,
        endOfRange,
        cancelled: false,
      })
      .orderBy('cs.startDateTime', 'ASC')
      .getMany();

    return bookings;
  }

  private async validateInstructorSession(
    {
      instructorId,
      startDateTime,
      endDateTime,
    }: { instructorId: string; startDateTime: string; endDateTime: string },
    sessionId?: string,
  ) {
    const instructorSession =
      await this.courseSessionInstructorRepository.findOne({
        join: {
          alias: 'csi',
          leftJoin: {
            courseSession: 'csi.courseSession',
          },
        },
        where: (qb: SelectQueryBuilder<CourseSession>) => {
          qb.where('csi.instructorId = :instructorId');
          if (sessionId) {
            qb.andWhere('courseSession.id <> :sessionId');
          }
          qb.andWhere(
            `((:startDateTime BETWEEN courseSession.startDateTime AND courseSession.endDateTime) OR 
            (:endDateTime BETWEEN courseSession.startDateTime AND courseSession.endDateTime) OR
            (courseSession.startDateTime BETWEEN :startDateTime AND :endDateTime) OR 
            (courseSession.endDateTime BETWEEN :startDateTime AND :endDateTime))`,
          )
            .andWhere('courseSession.cancelled = :cancelled')
            .setParameters({
              sessionId,
              endDateTime,
              startDateTime,
              instructorId,
              cancelled: false,
            });
        },
        loadEagerRelations: false,
        relations: [
          'courseSession',
          'courseSession.courseOutline',
          'instructor',
        ],
      });

    if (instructorSession) {
      throw new ForbiddenException({
        ...ERROR_CODES.INSTRUCTOR_SESSION_TIME_OVERLAP,
        data: {
          ...instructorSession,
          instructor: {
            firstName: instructorSession.instructor.firstName,
            lastName: instructorSession.instructor.lastName,
            fullName: instructorSession.instructor.fullName,
            email: instructorSession.instructor.email,
            imageKey: instructorSession.instructor.profileImageKey,
          },
        },
      });
    }
  }

  async getBookableUsersForCourseSession(
    courseSessionId: string,
    dto: BaseQueryDto,
  ) {
    const { skip, take } = getPaginationRequestParams(dto);
    const { search } = getSearchRequestParams(dto);

    const subQuery = this.courseSessionBookingRepository
      .createQueryBuilder('booking')
      .select('booking.studentId', 'student_id')
      .where('booking.isActive = :isActive')
      .andWhere('booking.courseSessionId = :courseSessionId');

    let query = this.userRepository
      .createQueryBuilder('user')
      .select('user.id', 'id')
      .addSelect('user.email', 'email')
      .where('user.isActive = :isActive')
      .andWhere(`user.id NOT IN(${subQuery.getSql()})`)
      .setParameters({
        courseSessionId,
        isActive: true,
      });

    if (search) {
      const delimiterRegexp = new RegExp(DELIMITER_PATTERN, 'gmi');
      if (delimiterRegexp.test(search)) {
        const emails = search
          .replace(delimiterRegexp, ',')
          .split(',')
          .map((email) => email?.trim())
          .filter((email) => !!email);
        if (emails.length) {
          query = query.andWhere('user.email IN(:...emails)', { emails });
        } else {
          query = query.andWhere('user.email ILIKE :search', {
            search: `%${search}%`,
          });
        }
      } else {
        query = query.andWhere('user.email ILIKE :search', {
          search: `%${search}%`,
        });
      }
    }

    const count = await query.getCount();

    type ResultType = {
      id: string;
      email: string;
    };

    const users = await query.offset(skip).limit(take).getRawMany<ResultType>();

    return { users, count };
  }

  async addStudentsToSession(courseSessionId: string, rawStudentIds: string[]) {
    // Get course session for reference later.
    const courseSession = await this.courseSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.courseOutline', 'courseOutline')
      .leftJoinAndSelect('session.courseSessionBooking', 'courseSessionBooking')
      .leftJoinAndSelect(
        'session.courseSessionInstructor',
        'courseSessionInstructor',
      )
      .leftJoinAndSelect('courseSessionInstructor.instructor', 'instructor')
      .leftJoinAndSelect('courseOutline.title', 'courseOutlineTitle')
      .leftJoinAndSelect('courseOutline.category', 'courseOutlineCategory')
      .where('session.isActive = :isActive')
      .andWhere('session.id = :courseSessionId')
      .setParameters({
        isActive: true,
        courseSessionId,
      })
      .getOneOrFail();

    const { courseId, id: couseOutlineId } = courseSession.courseOutline;
    const bookedStudentIds = courseSession.courseSessionBooking.map(
      (it) => it.studentId,
    );

    let getStudentQuery = this.userRepository
      .createQueryBuilder('user')
      .where('user.id IN(:...rawStudentIds)')
      .setParameters({
        courseSessionId,
        bookedStudentIds,
        rawStudentIds,
        isActive: true,
      });

    if (bookedStudentIds.length) {
      getStudentQuery = getStudentQuery.andWhere(
        'user.id NOT IN(:...bookedStudentIds)',
      );
    }

    const students = await getStudentQuery.getMany();

    const newStudentIds = students.map((it) => it.id);

    // If no new students just skip
    if (!newStudentIds.length) return;

    // Check if new users length exceed available seats.
    const sum =
      newStudentIds.length + courseSession.courseSessionBooking.length;
    if (sum > courseSession.seats)
      throw new HttpException(
        { ...ERROR_CODES.SESSION_ADD_REGISTRANTS_EXCEED_SEATS_LIMIT },
        HttpStatus.BAD_REQUEST,
      );

    // Enroll users to the course
    const userEnrolledCoursePromises = newStudentIds.map((userId) =>
      this.userEnrolledCourseRepository.upsert(
        {
          user: { id: userId },
          course: { id: courseId },
        },
        ['userId', 'courseId'],
      ),
    );
    await Promise.all(userEnrolledCoursePromises);

    // Enroll users to the course outline
    const userCourseOutlinePromises = newStudentIds.map((userId) =>
      this.userCourseOutlineProgressRepository.upsert(
        {
          courseOutline: { id: couseOutlineId },
          user: { id: userId },
          status: UserCourseOutlineProgressStatus.ENROLLED,
        },
        ['courseOutlineId', 'userId'],
      ),
    );
    await Promise.all(userCourseOutlinePromises);

    // Start to add student to session.
    const sessionBookingPromises = newStudentIds.map((studentId) =>
      this.courseSessionBookingRepository.upsert(
        {
          student: { id: studentId },
          courseSession: { id: courseSessionId },
        },
        ['studentId', 'courseSessionId'],
      ),
    );
    const results = await Promise.all(sessionBookingPromises);

    students.forEach((student, index) => {
      try {
        const bookingId = results[index]?.identifiers?.[0]?.id;
        if (bookingId) {
          this.sendEmailToRegistrants(courseSession, student, bookingId);
        }
      } catch (err) {
        //
      }
    });
  }

  private async sendEmailToRegistrants(
    session: CourseSession,
    registrant: User,
    bookingId: string,
  ) {
    if (!registrant.email) return;

    this.notificationProducer.sendEmail({
      key:
        session.courseOutline.category.key === CourseSubCategoryKey.FACE_TO_FACE
          ? EmailNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION_F2F
          : EmailNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION_VIRTUAL,
      language: registrant.emailNotificationLanguage,
      to: registrant.email,
      replacements: {
        [NotificationVariableDict.FULL_NAME.alias]: registrant.fullName,
        [NotificationVariableDict.SESSION_NAME.alias]: getStringFromLanguage(
          session.courseOutline.title,
          registrant.emailNotificationLanguage,
        ),
        [NotificationVariableDict.SESSION_START_DATETIME.alias]:
          formatWithTimezone(
            session.startDateTime,
            BANGKOK_TIMEZONE,
            'dd MMM yyyy HH:mm',
          ),
        [NotificationVariableDict.SESSION_END_DATETIME.alias]:
          formatWithTimezone(
            session.endDateTime,
            BANGKOK_TIMEZONE,
            'dd MMM yyyy HH:mm',
          ),
        [NotificationVariableDict.INSTRUCTOR_NAME.alias]:
          session.courseSessionInstructor?.[0]?.instructor?.fullName,
        [NotificationVariableDict.LOCATION_NAME.alias]: session.location,
        [NotificationVariableDict.WEBINAR_TOOL.alias]: session.webinarTool,
        [NotificationVariableDict.SESSION_WAITING_ROOM_LINK
          .alias]: `${process.env.CLIENT_BASE_URL}/dashboard/bookings/${bookingId}`,
        [NotificationVariableDict.COURSE_DETAIL_LINK
          .alias]: `${process.env.CLIENT_BASE_URL}/course-detail/${session.courseOutline.courseId}`,
      },
    });
  }
}
