import { Injectable } from '@nestjs/common';
import { User } from '@seaccentral/core/dist/user/User.entity';
import * as csv from 'fast-csv';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEnrolledCourse } from '@seaccentral/core/dist/course/UserEnrolledCourse.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { UserEnrolledCourseStatus } from '@seaccentral/core/dist/course/UserEnrolledCourseStatus.enum';
import {
  CourseSessionBooking,
  CourseSessionBookingStatus,
} from '@seaccentral/core/dist/course/CourseSessionBooking.entity';
import { formatWithTimezone } from '@seaccentral/core/dist/utils/date';
import { DEFAULT_TIMEZONE } from '@seaccentral/core/dist/utils/constants';

@Injectable()
export class CourseActivitiesRecordService {
  constructor(
    @InjectRepository(UserEnrolledCourse)
    private readonly userEnrolledCourseRepository: Repository<UserEnrolledCourse>,
    @InjectRepository(CourseSessionBooking)
    private readonly courseSessionBookingRepository: Repository<CourseSessionBooking>,
  ) {}

  async csvReport(user: User) {
    const [enrolledCourses, sessionBookings] = await Promise.all([
      this.userEnrolledCourseRepository.find({
        relations: [
          'course',
          'course.courseOutline',
          'course.courseOutline.learningWay',
        ],
        join: {
          alias: 'uec',
          leftJoin: {
            course: 'uec.course',
            courseTitle: 'course.title',
            courseOutline: 'course.courseOutline',
          },
        },
        where: (qb: SelectQueryBuilder<UserEnrolledCourse>) => {
          qb.where('uec.userId = :userId')
            .orderBy('courseTitle.nameEn', 'ASC')
            .addOrderBy('courseOutline.part', 'ASC')
            .setParameters({ userId: user.id });
        },
      }),
      this.courseSessionBookingRepository.find({
        relations: ['courseSession', 'courseSession.courseOutline'],
        join: {
          alias: 'csb',
          leftJoin: {
            courseSession: 'csb.courseSession',
          },
        },
        where: (qb: SelectQueryBuilder<CourseSessionBooking>) => {
          qb.where('csb.studentId = :userId')
            .orderBy('courseSession.startDateTime', 'ASC')
            .addOrderBy('courseSession.endDateTime', 'ASC')
            .setParameters({ userId: user.id });
        },
      }),
    ]);

    const csvstream = csv.format({
      headers: [
        'Email',
        'Course',
        'Outline',
        'Content Type',
        'Sub-category Type',
        'Start date',
        'End date',
        'Status',
      ],
    });

    enrolledCourses.forEach((uec) =>
      uec.course.courseOutline.forEach((co) => {
        const base = {
          Email: user.email,
          Course: uec.course.title?.nameEn,
          Outline: co.title?.nameEn,
          'Content Type': co.learningWay.name,
          'Sub-category Type': co.category.name,
          'Start date': '',
          'End date': '',
          Status: this.mapEnrolledStatus(uec.status),
        };
        const bookings = sessionBookings.filter(
          (sb) => sb.courseSession.courseOutline.id === co.id,
        );
        if (bookings.length <= 0) {
          csvstream.write(base);
        } else {
          bookings.forEach((booking) =>
            csvstream.write({
              ...base,
              'Start date': formatWithTimezone(
                booking.courseSession.startDateTime,
                DEFAULT_TIMEZONE,
                'dd-MMM-yyyy HH:mm',
              ),
              'End date': formatWithTimezone(
                booking.courseSession.endDateTime,
                DEFAULT_TIMEZONE,
                'dd-MMM-yyyy HH:mm',
              ),
              Status: this.mapSessionStatus(booking.status),
            }),
          );
        }
      }),
    );
    csvstream.end();
    return csvstream;
  }

  private mapEnrolledStatus(key: UserEnrolledCourseStatus) {
    const enrolledStatusMap: Record<UserEnrolledCourseStatus, string> = {
      [UserEnrolledCourseStatus.ENROLLED]: 'Enrolled',
      [UserEnrolledCourseStatus.IN_PROGRESS]: 'In Progress',
      [UserEnrolledCourseStatus.COMPLETED]: 'Completed',
    };
    return enrolledStatusMap[key];
  }

  private mapSessionStatus(key: CourseSessionBookingStatus) {
    const sessionStatusMap: Record<CourseSessionBookingStatus, string> = {
      [CourseSessionBookingStatus.ATTENDED]: 'Attended',
      [CourseSessionBookingStatus.NOT_ATTENDED]: 'Not Attended',
      [CourseSessionBookingStatus.NO_MARK]: 'No Mark',
      [CourseSessionBookingStatus.CANCELLED]: 'Cancelled',
    };

    return sessionStatusMap[key];
  }
}
