import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import * as csv from 'fast-csv';
import { Injectable, Logger } from '@nestjs/common';
import {
  dateToUTCDate,
  formatWithTimezone,
} from '@seaccentral/core/dist/utils/date';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '@seaccentral/core/dist/course/Course.entity';
import {
  CourseSession,
  getStatus,
} from '@seaccentral/core/dist/course/CourseSession.entity';
import { getPaginationRequestParams } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { DEFAULT_TIMEZONE } from '@seaccentral/core/dist/utils/constants';
import { CourseSessionBookingStatus } from '@seaccentral/core/dist/course/CourseSessionBooking.entity';
import { CourseSessionStatus } from '@seaccentral/core/dist/course/CourseSessionStatus.enum';
import { getFullName } from '@seaccentral/core/dist/user/User.entity';

import { groupBy } from 'lodash';
import { CourseSessionManagementQueryDto } from './dto/course-sessions/CourseSessionManagementQuery.dto';
import {
  CourseOutlineDto,
  CourseSessionManagementResponseDto,
} from './dto/course-sessions/CourseSessionManagementResponse.dto';
import { CourseSessionManagementDetailQueryDto } from './dto/course-sessions/CourseSessionManagementDetailQuery.dto';
import { CourseSessionDto } from './dto/course-sessions/CourseSessionResponse.dto';
import { GetSuggestionRequestDto } from './dto/course-sessions/GetSuggestionRequest.dto';

@Injectable()
export class CourseSessionManagementService {
  private readonly logger = new Logger(CourseSessionManagementService.name);

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseSession)
    private courseSessionRepository: Repository<CourseSession>,
    @InjectRepository(CourseOutline)
    private courseOutlineRepository: Repository<CourseOutline>,
  ) {}

  async getCourses(
    queryDto: CourseSessionManagementQueryDto,
  ): Promise<
    CourseSessionManagementResponseDto & { totalCourseCount: number }
  > {
    let totalSessionCountQuery = this.courseSessionRepository
      .createQueryBuilder('courseSession')
      .leftJoinAndSelect('courseSession.courseSessionInstructor', 'instructor')
      .leftJoinAndSelect('courseSession.courseOutline', 'courseOutline')
      .leftJoinAndSelect('courseOutline.title', 'outlineTitle')
      .leftJoinAndSelect('courseOutline.course', 'course')
      .leftJoinAndSelect('course.title', 'courseTitle')
      .leftJoinAndSelect('courseOutline.category', 'category')
      .where('courseSession.startDateTime >= :startTime', {
        startTime: queryDto.startTime,
      });

    totalSessionCountQuery = this.applyOptionalFilter(
      totalSessionCountQuery,
      queryDto,
    );

    const totalSessionCount = await totalSessionCountQuery.getCount();

    const { skip, take } = getPaginationRequestParams(queryDto);

    let courseQuery = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.title', 'courseTitle')
      .leftJoinAndSelect('course.courseOutline', 'courseOutline')
      .leftJoinAndSelect('courseOutline.category', 'category')
      .leftJoinAndSelect('courseOutline.title', 'outlineTitle')
      .leftJoinAndSelect('courseOutline.courseSession', 'courseSession')
      .leftJoinAndSelect('courseSession.courseSessionInstructor', 'instructor')
      .where('courseSession.startDateTime >= :startTime', {
        startTime: queryDto.startTime,
      })
      .orderBy('courseTitle.nameEn', 'ASC');

    courseQuery = this.applyOptionalFilter(courseQuery, queryDto);

    const totalCourseCount = await courseQuery.getCount();
    const courses = await courseQuery.skip(skip).take(take).getMany();

    const courseDto: CourseSessionManagementResponseDto['courses'] =
      courses.map((course) => ({
        title: course.title ? course.title.nameEn : '',
        id: course.id,
        imageKey: course.imageKey || '',
        sessionCount: course.courseOutline.reduce(
          (prev, current) => prev + current.courseSession.length,
          0,
        ),
        courseOutlines: course.courseOutline.map<CourseOutlineDto>(
          (outline) => ({
            title: outline.title ? outline.title.nameEn : '',
            subCategory: outline.category.key,
            id: outline.id,
          }),
        ),
      }));

    return { totalSessionCount, totalCourseCount, courses: courseDto };
  }

  async getCourseSessions(
    queryDto: CourseSessionManagementDetailQueryDto,
  ): Promise<CourseSessionDto | undefined> {
    const startTime = new Date(queryDto.startTime);

    let courseQuery = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.title', 'courseTitle')
      .leftJoinAndSelect('course.courseOutline', 'courseOutline')
      .leftJoinAndSelect('courseOutline.category', 'category')
      .leftJoinAndSelect('courseOutline.title', 'outlineTitle')
      .leftJoinAndSelect('courseOutline.courseSession', 'courseSession')
      .leftJoinAndSelect('courseSession.courseSessionInstructor', 'instructor')
      .leftJoinAndSelect('courseSession.courseSessionBooking', 'booking')
      .where('courseSession.startDateTime >= :startTime', {
        startTime,
      })
      .andWhere('course.id = :id', {
        id: queryDto.courseId,
      });

    courseQuery = this.applyOptionalFilter(courseQuery, queryDto);

    courseQuery
      .orderBy('outlineTitle.nameEn', 'ASC')
      .addOrderBy('courseSession.startDateTime', 'ASC');

    const course = await courseQuery.getOne();

    if (!course?.courseOutline) return undefined;

    const dto: CourseSessionDto = {
      courseOutlines: course.courseOutline.map((outline) => ({
        id: outline.id,
        title: outline.title,
        subCategory: outline.category.key,
        courseSessions: outline.courseSession.map((session) => ({
          id: session.id,
          startTime: session.startDateTime,
          endTime: session.endDateTime,
          seats: session.seats,
          booked: session.courseSessionBooking.length,
          cancelled: session.cancelled,
          instructorIds: session.courseSessionInstructor.map(
            (i) => i.instructorId,
          ),
        })),
      })),
    };

    return dto;
  }

  async getSuggestions(query: GetSuggestionRequestDto): Promise<string[]> {
    if (query.search.trim() === '') return [];

    type Lang = { en?: string; th?: string };
    const result: string[] = [];

    const courseResult: Lang[] = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.title', 'courseTitle')
      .select('courseTitle.nameEn', 'en')
      .addSelect('courseTitle.nameTh', 'th')
      .where(
        'courseTitle.nameEn ILIKE :search OR courseTitle.nameTh ILIKE :search',
        {
          search: `%${query.search}%`,
        },
      )
      .limit(5)
      .getRawMany();

    courseResult.forEach((course) => {
      if (course.en?.toLowerCase().includes(query.search.toLowerCase()))
        result.push(course.en);
      else if (course.th?.toLowerCase().includes(query.search.toLowerCase()))
        result.push(course.th);
    });

    const outlineResult: Lang[] = await this.courseOutlineRepository
      .createQueryBuilder('outline')
      .leftJoin('outline.title', 'outlineTitle')
      .select('outlineTitle.nameEn', 'en')
      .addSelect('outlineTitle.nameTh', 'th')
      .where(
        'outlineTitle.nameEn ILIKE :search OR outlineTitle.nameTh ILIKE :search',
        {
          search: `%${query.search}%`,
        },
      )
      .limit(5)
      .getRawMany();

    outlineResult.forEach((outline) => {
      if (outline.en?.toLowerCase().includes(query.search.toLowerCase()))
        result.push(outline.en);
      else if (outline.th?.toLowerCase().includes(query.search.toLowerCase()))
        result.push(outline.th);
    });

    return result;
  }

  async generateSessionReport(
    queryDto: CourseSessionManagementQueryDto,
  ): Promise<{ stream: csv.CsvFormatterStream<any, any>; fileName: string }> {
    const { skip, take } = getPaginationRequestParams(queryDto);

    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.title', 'courseTitle')
      .leftJoin('course.courseOutline', 'courseOutline')
      .leftJoin('courseOutline.category', 'category')
      .leftJoin('courseOutline.title', 'outlineTitle')
      .leftJoin('courseOutline.courseSession', 'courseSession')
      .leftJoin('courseSession.courseSessionInstructor', 'instructor')
      .leftJoin('courseSession.courseSessionBooking', 'booking')
      .leftJoin('instructor.instructor', 'instructorInfo')
      .select([
        'courseTitle.nameEn',
        'COUNT(booking.id)',
        'courseSession.id',
        'course.id',
        'instructorInfo.firstName',
        'instructorInfo.lastName',
        'TO_CHAR("courseSession"."startDateTime" at time zone \'Asia/Bangkok\', \'dd/MM/yyyy HH24:MI\') as start',
        'TO_CHAR("courseSession"."endDateTime" at time zone \'Asia/Bangkok\', \'dd/MM/yyyy HH24:MI\') as end',
        'booking.status',
        'courseSession.cancelled',
        'outlineTitle.nameEn',
        'courseSession.seats',
        'courseSession.location',
        'courseSession.endDateTime as raw_end',
        'courseSession.startDateTime as raw_start',
      ])
      .groupBy()
      .addGroupBy('course.id')
      .addGroupBy('courseTitle.nameEn')
      .addGroupBy('courseSession.id')
      .addGroupBy('instructorInfo.id')
      .addGroupBy('booking.status')
      .addGroupBy('outlineTitle.nameEn')
      .where('courseSession.startDateTime >= :startTime', {
        startTime: queryDto.startTime,
      })
      .orderBy('courseTitle.nameEn', 'ASC');

    type Raw = {
      course_id: string;
      courseTitle_nameEn: string;
      courseSession_id: string;
      booking_status: string | null;
      instructorInfo_firstName: string | null;
      instructorInfo_lastName: string | null;
      count: number;
      start: string;
      end: string;
      courseSession_cancelled: boolean;
      outlineTitle_nameEn: string;
      courseSession_seats: string;
      courseSession_location: string;
      raw_end: Date;
      raw_start: Date;
    };
    const courses = await this.applyOptionalFilter(query, queryDto)
      .skip(skip)
      .take(take)
      .getRawAndEntities<Raw>();

    const grouped: Record<string, Raw[]> = groupBy(
      courses.raw,
      'courseSession_id',
    );

    const stream = csv.format({ headers: true });
    stream.on('error', (err) => this.logger.error(err));

    Object.keys(grouped).forEach((courseSessionId) => {
      const rawData = grouped[courseSessionId][0];

      const data = {
        'Course Title': rawData.courseTitle_nameEn,
        'Course outline title': rawData.outlineTitle_nameEn,
        'Session start date/time': rawData.start,
        'Session end date/time': rawData.end,
        Status: getStatus({
          cancelled: rawData.courseSession_cancelled,
          startDateTime: rawData.raw_start,
          endDateTime: rawData.raw_end,
        }),
        Instructor: getFullName({
          firstName: rawData.instructorInfo_firstName,
          lastName: rawData.instructorInfo_lastName,
        }),
        'Enrollment Limit': rawData.courseSession_seats,
        Registrants: rawData.count || 0,
        Attendees:
          grouped[courseSessionId].filter(
            (b) => b.booking_status === CourseSessionBookingStatus.ATTENDED,
          ).length || 0,
        Location: rawData.courseSession_location,
      };
      stream.write(data);
    });

    stream.end();

    const formattedStartTime = formatWithTimezone(
      new Date(queryDto.startTime),
      DEFAULT_TIMEZONE,
      'ddMMyyyy',
    );
    const formattedEndTime = queryDto.endTime
      ? `-${formatWithTimezone(
          new Date(queryDto.endTime),
          DEFAULT_TIMEZONE,
          'ddMMyyyy',
        )}`
      : '';

    return {
      stream,
      fileName: `sessionreport_${formattedStartTime}${formattedEndTime}`,
    };
  }

  applyOptionalFilter<T>(
    builder: SelectQueryBuilder<T>,
    filter: Partial<CourseSessionManagementDetailQueryDto>,
  ) {
    const { endTime, search, instructorIds, type, status } = filter;

    if (endTime)
      builder = builder.andWhere('courseSession.startDateTime <= :endTime', {
        endTime,
      });

    if (search) {
      builder = builder.andWhere(
        new Brackets((qb) => {
          qb.where(
            'outlineTitle.nameEn ILIKE :search OR outlineTitle.nameTh ILIKE :search',
            {
              search: `%${search}%`,
            },
          ).orWhere(
            'courseTitle.nameEn ILIKE :search OR courseTitle.nameTh ILIKE :search',
            {
              search: `%${search}%`,
            },
          );
        }),
      );
    }

    if (typeof instructorIds === 'string') {
      builder = builder.andWhere('instructor.instructorId = :instructorIds', {
        instructorIds,
      });
    } else if (instructorIds?.length) {
      builder = builder.andWhere(
        'instructor.instructorId IN(:...instructorIds)',
        {
          instructorIds,
        },
      );
    }

    if (type) {
      builder = builder.andWhere('category.key = :type', { type });
    }

    if (status) {
      const now = new Date();

      if (status === CourseSessionStatus.CANCELLED) {
        builder = builder.andWhere('courseSession.cancelled = true');
      } else {
        builder = builder.andWhere('courseSession.cancelled = false');
      }

      if (status === CourseSessionStatus.NOT_STARTED)
        builder = builder.andWhere('courseSession.startDateTime > :now');
      else if (status === CourseSessionStatus.IN_PROGRESS) {
        builder = builder
          .andWhere('courseSession.startDateTime <= :now')
          .andWhere('courseSession.endDateTime > :now');
      } else if (status === CourseSessionStatus.COMPLETED) {
        builder = builder.andWhere('courseSession.endDateTime <= :now');
      }

      builder = builder.setParameters({ now });
    }

    return builder;
  }
}
