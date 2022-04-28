import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import {
  getPaginationRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { cacheKeys } from '@seaccentral/core/dist/redis/cacheKeys';
import { Course } from '@seaccentral/core/dist/course/Course.entity';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { RedisCacheService } from '@seaccentral/core/dist/redis/redisCache.service';
import { UserArchivedCourse } from '@seaccentral/core/dist/course/UserArchivedCourse.entity';

import {
  GetAllEnrolledCoursesQueryDto,
  LearningStatus,
} from './dto/GetAllEnrolledCoursesQuery.dto';

@Injectable()
export class UserCourseService {
  private logger = new Logger(UserCourseService.name);

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(UserArchivedCourse)
    private userArchivedCourseRepository: Repository<UserArchivedCourse>,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async getAllEnrolledCourses(
    user: User,
    dto: GetAllEnrolledCoursesQueryDto,
    languageCode: LanguageCode,
  ) {
    const { skip, take } = getPaginationRequestParams(dto);
    const { orderBy } = getSortRequestParams(dto);
    const { topicId, learningWayId, status, assignmentType } = dto;

    const lang = languageCode === LanguageCode.EN ? 'En' : 'Th';

    let courseQuery = this.courseRepository
      .createQueryBuilder('c')
      .innerJoin(
        'c.userEnrolledCourse',
        'userEnrolledCourse',
        'userEnrolledCourse.isActive = :isActive AND userEnrolledCourse.userId = :userId',
      )
      .leftJoin(
        'c.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
      )
      .leftJoin(
        'c.courseTopic',
        'courseTopic',
        'courseTopic.isActive = :isActive',
      )
      .leftJoin(
        'c.userArchivedCourse',
        'userArchivedCourse',
        'userArchivedCourse.isActive = :isActive AND userArchivedCourse.userId = :userId',
      )
      .leftJoin('c.title', 'title')
      .leftJoin('c.tagLine', 'tagLine')
      .leftJoin('c.category', 'category')
      .leftJoin('courseOutline.category', 'subCategory')
      .leftJoin('courseOutline.learningWay', 'learningWay')
      .leftJoin(
        'c.userAssignedCourse',
        'userAssignedCourse',
        'userAssignedCourse.userId = :userId',
      )
      .select('c.id', 'id')
      .groupBy('c.id')
      .where('c.isActive = :isActive')
      .setParameters({
        userId: user.id,
        isActive: true,
      });

    if (assignmentType) {
      courseQuery.andWhere(
        'userAssignedCourse.assignmentType = :assignmentType',
        { assignmentType },
      );
    }

    if (topicId) {
      courseQuery = courseQuery.andWhere('courseTopic.topicId = :topicId', {
        topicId,
      });
    }

    if (learningWayId) {
      courseQuery = courseQuery.andWhere('learningWay.id = :learningWayId', {
        learningWayId,
      });
    }

    if (status) {
      if (status === LearningStatus.NOT_STARTED) {
        courseQuery = courseQuery
          .andWhere('userEnrolledCourse.percentage <= 0')
          .having('COUNT(userArchivedCourse.courseId) < 1');
      } else if (status === LearningStatus.IN_PROGRESS) {
        courseQuery = courseQuery
          .andWhere(
            'userEnrolledCourse.percentage > 0 AND userEnrolledCourse.percentage < 100',
          )
          .having('COUNT(userArchivedCourse.courseId) < 1');
      } else if (status === LearningStatus.COMPLETED) {
        courseQuery = courseQuery
          .andWhere('userEnrolledCourse.percentage >= 100')
          .having('COUNT(userArchivedCourse.courseId) < 1');
      } else if (status === LearningStatus.ARCHIVED) {
        courseQuery = courseQuery.having(
          'COUNT(userArchivedCourse.courseId) > 0',
        );
      }
    }

    const totalRows = await courseQuery.getRawMany();
    const count = totalRows.length;

    courseQuery = courseQuery
      .offset(skip)
      .limit(take)
      .addSelect('c.imageKey', 'imageKey')
      .addSelect(`title.name${lang}`, 'title')
      .addSelect(`tagLine.name${lang}`, 'tagLine')
      .addSelect('c.availableLanguage', 'availableLanguage')
      .addSelect('c.durationMonths', 'durationMonths')
      .addSelect('c.durationWeeks', 'durationWeeks')
      .addSelect('c.durationDays', 'durationDays')
      .addSelect('c.durationHours', 'durationHours')
      .addSelect('c.durationMinutes', 'durationMinutes')
      .addSelect('COALESCE(category.key)', 'categoryKey')
      .addSelect('CAST(COUNT(courseOutline.id) AS INTEGER)', 'lessonLength')
      .addSelect('userAssignedCourse.assignmentType', 'userAssignedCourseType')
      .addSelect('userEnrolledCourse.percentage', 'averagePercentage')
      .addSelect(
        (qb) =>
          qb
            .select('fco.id')
            .from(CourseOutline, 'fco')
            .orderBy('fco.part', 'ASC')
            .where('fco.courseId = c.id AND fco.isActive = :isActive')
            .limit(1),
        'firstCourseOutlineId',
      )
      .addSelect(
        (qb) =>
          qb
            .select('COUNT(uac.id) > 0', 'isArchived')
            .from(UserArchivedCourse, 'uac')
            .where(
              'uac.courseId = c.id AND uac.userId = :userId AND uac.isActive = :isActive',
            )
            .limit(1),
        'isArchived',
      )
      .addSelect('userAssignedCourse.dueDateTime', 'dueDateTime')
      .addGroupBy(`title.name${lang}`)
      .addGroupBy('userAssignedCourse.assignmentType')
      .addGroupBy('userAssignedCourse.updatedAt')
      .addGroupBy(`tagLine.name${lang}`)
      .addGroupBy('userEnrolledCourse.createdAt')
      .addGroupBy('category.key')
      .addGroupBy('userEnrolledCourse.percentage')
      .addGroupBy('userAssignedCourse.dueDateTime');

    if (orderBy === 'title') {
      courseQuery = courseQuery.orderBy(`title.name${lang}`, 'ASC');
    } else if (orderBy === 'requiredCourse' || orderBy === 'assignedCourse') {
      courseQuery = courseQuery
        .orderBy(
          'userAssignedCourse.assignmentType',
          orderBy === 'requiredCourse' ? 'DESC' : 'ASC',
          'NULLS LAST',
        )
        .addOrderBy('userAssignedCourse.updatedAt', 'DESC', 'NULLS LAST');
    } else {
      courseQuery = courseQuery
        .orderBy('userEnrolledCourse.createdAt', 'DESC')
        .addOrderBy('c.createdAt', 'DESC');
    }

    const courses = await courseQuery.getRawMany();

    return { courses, count };
  }

  async getAllEnrolledCourseStatuses(
    user: User,
    dto: GetAllEnrolledCoursesQueryDto,
  ) {
    const { topicId, learningWayId } = dto;

    const cacheKey = cacheKeys.USER_DASHBOARD.COURSES_STATS.replace(
      '$userId',
      user.id,
    )
      .replace('$topicId', topicId || '')
      .replace('$learningWayId', learningWayId || '');
    const cachedStats = await this.redisCacheService.get(cacheKey);

    if (cachedStats) return cachedStats;

    let courseQuery = this.courseRepository
      .createQueryBuilder('course')
      .innerJoin(
        'course.userEnrolledCourse',
        'userEnrolledCourse',
        'userEnrolledCourse.isActive = :isActive',
      )
      .leftJoin(
        'course.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
      )
      .leftJoin(
        'course.userArchivedCourse',
        'userArchivedCourse',
        'userArchivedCourse.isActive = :isActive AND userArchivedCourse.userId = :userId',
      )
      .where('course.isActive = :isActive')
      .andWhere('userEnrolledCourse.userId = :userId')
      .setParameters({
        userId: user.id,
        isActive: true,
      })
      .select('course.id', 'course_id')
      .addSelect('userEnrolledCourse.percentage', 'percentage')
      .having('COUNT(userArchivedCourse.courseId) < 1')
      .groupBy('course_id')
      .addGroupBy('userEnrolledCourse.percentage');

    if (topicId) {
      courseQuery = courseQuery
        .leftJoin(
          'course.courseTopic',
          'courseTopic',
          'courseTopic.isActive = :isActive',
        )
        .leftJoin('courseTopic.topic', 'topic', 'topic.isActive = :isActive')
        .andWhere('topic.id = :topicId', {
          topicId,
        });
    }

    if (learningWayId) {
      courseQuery = courseQuery
        .leftJoin(
          'courseOutline.learningWay',
          'learningWay',
          'learningWay.isActive = :isActive',
        )
        .andWhere('learningWay.id = :learningWayId', {
          learningWayId,
        });
    }

    const courses = await courseQuery.getRawMany();

    const countArchived = await this.countArchivedCourses(
      user,
      topicId,
      learningWayId,
    );

    const data = {
      notStarted: courses.filter((c) => c.percentage <= 0).length,
      inProgress: courses.filter((c) => c.percentage > 0 && c.percentage < 100)
        .length,
      completed: courses.filter((c) => c.percentage >= 100).length,
      archived: countArchived,
    };

    this.redisCacheService
      .set(cacheKey, data, { ttl: 30 })
      .catch((err) => this.logger.error('Error caching COURSES_STATS', err));

    return data;
  }

  countArchivedCourses(user: User, topicId?: string, learningWayId?: string) {
    let query = this.userArchivedCourseRepository
      .createQueryBuilder('archivedCourse')
      .innerJoin(
        'archivedCourse.course',
        'course',
        'course.isActive = :isActive',
      )
      .innerJoin('archivedCourse.user', 'user', 'user.isActive = :isActive')
      .where('archivedCourse.isActive = :isActive')
      .andWhere('archivedCourse.userId = :userId')
      .setParameters({
        userId: user.id,
        isActive: true,
      });

    if (topicId) {
      query = query
        .leftJoin(
          'course.courseTopic',
          'courseTopic',
          'courseTopic.isActive = :isActive',
        )
        .leftJoin('courseTopic.topic', 'topic', 'topic.isActive = :isActive')
        .andWhere('topic.id = :topicId', {
          topicId,
        });
    }

    if (learningWayId) {
      query = query
        .leftJoin(
          'course.courseOutline',
          'courseOutline',
          'courseOutline.isActive = :isActive',
        )
        .leftJoin(
          'courseOutline.learningWay',
          'learningWay',
          'learningWay.isActive = :isActive',
        )
        .andWhere('learningWay.id = :learningWayId', {
          learningWayId,
        });
    }

    return query.getCount();
  }

  async isCourseExists(courseId: string) {
    const count = await this.courseRepository.count({ id: courseId });
    return count > 0;
  }

  async addArchiveCourse(courseId: string, user: User) {
    const exists = await this.isCourseExists(courseId);
    if (!exists)
      throw new HttpException('Course not found.', HttpStatus.NOT_FOUND);

    return this.userArchivedCourseRepository.save({
      course: { id: courseId },
      user,
      isActive: true,
    });
  }

  async removeArchiveCourse(courseId: string, user: User) {
    const exists = await this.isCourseExists(courseId);
    if (!exists)
      throw new HttpException('Course not found.', HttpStatus.NOT_FOUND);

    await this.userArchivedCourseRepository.delete({
      course: { id: courseId },
      user,
    });
  }
}
