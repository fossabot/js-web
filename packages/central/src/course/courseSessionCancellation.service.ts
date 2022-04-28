import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseSession } from '@seaccentral/core/dist/course/CourseSession.entity';
import { CourseSessionBooking } from '@seaccentral/core/dist/course/CourseSessionBooking.entity';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import {
  Reason,
  UserCourseSessionCancellationLog,
} from '@seaccentral/core/dist/course/UserCourseSessionCancellationLog.entity';

import { User } from '@seaccentral/core/dist/user/User.entity';
import {
  dateToISOString,
  dateToUTCDate,
} from '@seaccentral/core/dist/utils/date';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import {
  getPaginationRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { EmailNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/EmailNotificationSubCategory.enum';
import { NotificationService } from '@seaccentral/core/dist/notification/Notification.service';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { classToPlain } from 'class-transformer';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';
import { NOTIFICATION_DATE_FORMAT } from '@seaccentral/core/dist/utils/constants';
import { NotificationVariableDict as NV } from '@seaccentral/core/dist/notification/NotificationVariableDict';

import { isAfter } from 'date-fns';
import { getLanguageFromDate } from '@seaccentral/core/dist/utils/language';
import { CourseSessionService } from './courseSession.service';
import { UserSessionManagement } from './dto/course-sessions/UserSessionManagement.dto';
import { CourseSessionCancellationBody } from './dto/CourseSessionCancellationBody.dto';
import { CourseSessionQueryDto } from './dto/CourseSessionQuery.dto';
import { IRawUserCancellationLog } from './interface/IRawUserCancellationLog';

@Injectable()
export class CourseSessionCancellationService extends TransactionFor<CourseSessionCancellationService> {
  constructor(
    moduleRef: ModuleRef,
    @InjectRepository(UserCourseSessionCancellationLog)
    private readonly userCourseSessionCancellationRepository: Repository<UserCourseSessionCancellationLog>,
    @InjectRepository(CourseSessionBooking)
    private readonly courseSessionBookingRepository: Repository<CourseSessionBooking>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CourseSession)
    private readonly courseSessionRepository: Repository<CourseSession>,
    private readonly courseSessionService: CourseSessionService,
    private readonly notificationService: NotificationService,
    private readonly notificationProducer: NotificationProducer,
  ) {
    super(moduleRef);
  }

  async getAttendants(courseSessionId: string, queryOptions: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(queryOptions);
    const { order, orderBy } = getSortRequestParams(queryOptions);

    const query = this.userCourseSessionCancellationRepository
      .createQueryBuilder('usc')
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
        'subscription."userId" = usc.userId',
      )
      .distinctOn(['usc.userId', 'subscription."expiryDate"'])
      .where('usc.courseSessionId = :id')
      .groupBy(
        'usc."userId", usc."id", subscription."userId", subscription."expiryDate"',
      )
      .setParameters({
        id: courseSessionId,
      });

    if (orderBy === 'expiryDate') {
      query.orderBy('subscription."expiryDate"', order);
    }

    const raw = await query
      .limit(take)
      .offset(skip)
      .getRawMany<IRawUserCancellationLog>();

    if (raw.length <= 0)
      return {
        users: [],
        count: 0,
      };

    const { count } = await this.userCourseSessionCancellationRepository
      .createQueryBuilder('usc')
      .select('COUNT(DISTINCT(usc."userId"))', 'count')
      .where('usc.courseSessionId = :id')
      .setParameters({ id: courseSessionId })
      .getRawOne();

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
          ids: raw.map((r) => r.usc_userId),
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
                userEntities.find((user) => user.id === r.usc_userId) as User,
                r,
              ),
          )
        : userEntities.map(
            (user) =>
              new UserSessionManagement(
                user,
                raw.find((r) => r.usc_userId === user.id),
              ),
          ),
    ) as UserSessionManagement[];

    return { users, count };
  }

  async getUserCancellation(user: User, dto: CourseSessionQueryDto) {
    const result = this.userCourseSessionCancellationRepository.find({
      relations: [
        'courseSession',
        'courseSession.courseOutline',
        'courseSession.courseOutline.course',
        'courseSession.courseOutline.learningWay',
        'courseSession.courseSessionInstructor',
      ],
      join: {
        alias: 'usc',
        leftJoin: {
          courseSession: 'usc.courseSession',
        },
      },
      where: (qb: SelectQueryBuilder<UserCourseSessionCancellationLog>) => {
        qb.where('"userId" = :userId', { userId: user.id });
        qb.orderBy('courseSession.startDateTime', 'ASC');
        if (dto.startTime && dto.endTime) {
          const startTime = dateToUTCDate(new Date(dto.startTime));
          const endTime = dateToUTCDate(new Date(dto.endTime));
          qb.andWhere(
            'courseSession.startDateTime BETWEEN :startTime AND :endTime',
            {
              startTime,
              endTime,
            },
          );
        }
      },
    });

    return result;
  }

  async cancelSession(
    courseSessionId: string,
    dto: CourseSessionCancellationBody,
    cancelledByUser?: User,
    now = dateToISOString(new Date()),
  ) {
    const { session, isEnded } = await this.isSessionEnded(
      courseSessionId,
      new Date(now),
    );

    const startDateTime = getLanguageFromDate(
      session.startDateTime,
      NOTIFICATION_DATE_FORMAT,
    );

    const endDateTime = getLanguageFromDate(
      session.endDateTime,
      NOTIFICATION_DATE_FORMAT,
    );

    const variables = {
      [NV.SESSION_NAME.alias]: session.courseOutline.title,
      [NV.SESSION_END_DATETIME.alias]: endDateTime,
      [NV.SESSION_START_DATETIME.alias]: startDateTime,
    };

    const { userIds } = dto;

    let students: User[] = [];
    let reason: Reason;

    if (!userIds) {
      if (isEnded) throw new BadRequestException('session has already ended');

      await this.courseSessionRepository.update(
        { id: courseSessionId },
        { cancelled: true },
      );

      const bookings = await this.courseSessionBookingRepository.find({
        courseSessionId,
      });

      reason = Reason.CancelledSession;
      students = bookings.map((booking) => booking.student);

      students.forEach((student) =>
        this.notificationProducer
          .notify(
            PushNotificationSubCategoryKey.LEARNING_ACTIVITY_SESSION_CANCELLED_BY_ADMIN,
            student.id,
            variables,
          )
          .catch(),
      );
    } else {
      reason = Reason.CancelledByAdmin;
      students = await this.userRepository.findByIds(userIds);

      students.forEach((student) =>
        this.notificationProducer
          .notify(
            PushNotificationSubCategoryKey.LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_ADMIN,
            student.id,
            variables,
          )
          .catch(),
      );
    }

    await Promise.allSettled(
      students.map(async (student) => {
        await this.courseSessionService
          .deleteCourseSessionBooking({
            courseSessionId,
            student,
            cancelledByUser,
            reason,
          })
          .catch((e) => {
            console.error('error', e);
          });
      }),
    );

    if (reason === Reason.CancelledSession) {
      const emailNotificationKey = userIds
        ? EmailNotificationSubCategoryKey.BOOKING_CANCELLATION
        : EmailNotificationSubCategoryKey.BOOKING_CANCELLATION_BY_ADMIN;

      const receiverRoles =
        await this.notificationService.getEmailReceiverRoles(
          emailNotificationKey,
        );

      let moderators: User[] = [];
      let instructors: User[] = [];

      if (receiverRoles.moderator) {
        moderators = await this.notificationService.getModerators();
      }
      if (receiverRoles.instructor) {
        instructors = session.courseSessionInstructor.map(
          (csi) => csi.instructor,
        );
      }

      [...instructors, ...moderators].forEach((user) => {
        this.courseSessionService.sendSessionCancellationEmail(user, session);
      });
    }

    return students;
  }

  private async isSessionEnded(sessionId: string, now: Date) {
    const session = await this.courseSessionRepository.findOne(
      {
        id: sessionId,
      },
      {
        relations: [
          'courseOutline',
          'courseSessionInstructor',
          'courseSessionInstructor.instructor',
          'courseOutline.title',
        ],
      },
    );

    if (!session) throw new NotFoundException('Session not found');

    return { session, isEnded: isAfter(now, session?.endDateTime) };
  }
}
