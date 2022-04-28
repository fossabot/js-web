import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CourseDiscovery,
  CourseDiscoveryType,
} from '@seaccentral/core/dist/course-discovery/CourseDiscovery.entity';
import { cacheKeys } from '@seaccentral/core/dist/redis/cacheKeys';
import { RedisCacheService } from '@seaccentral/core/dist/redis/redisCache.service';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { Repository } from 'typeorm';
import { SaveCourseDiscoveryDto } from './dto/SaveCourseDiscovery.dto';

@Injectable()
export class CourseDiscoveryService extends TransactionFor<CourseDiscoveryService> {
  private logger = new Logger(CourseDiscoveryService.name);

  constructor(
    @InjectRepository(CourseDiscovery)
    private courseDiscoveryRepo: Repository<CourseDiscovery>,
    private readonly redisCacheService: RedisCacheService,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async getCourseDiscovery(user: User) {
    const cachedCourseDiscoveries = await this.redisCacheService.get<
      CourseDiscovery[]
    >(cacheKeys.USER_DASHBOARD.COURSE_DISCOVERY);

    if (cachedCourseDiscoveries) return cachedCourseDiscoveries;

    const courseDiscoveries = await this.courseDiscoveryRepo
      .createQueryBuilder('cd')
      .leftJoinAndSelect('cd.course', 'course')
      .leftJoinAndSelect('course.title', 'title')
      .leftJoinAndSelect('course.tagLine', 'tagLine')
      .leftJoinAndSelect('course.description', 'description')
      .leftJoinAndSelect('course.learningObjective', 'learningObjective')
      .leftJoinAndSelect('course.courseTarget', 'courseTarget')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.courseTag', 'courseTag')
      .leftJoinAndSelect('course.courseTopic', 'courseTopic')
      .leftJoinAndSelect(
        'course.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect('courseOutline.category', 'subCategory')
      .leftJoinAndSelect('courseOutline.learningWay', 'learningWay')
      .leftJoinAndSelect(
        'course.userAssignedCourse',
        'userAssignedCourse',
        'userAssignedCourse.userId = :userId',
        { userId: user.id },
      )
      .getMany();

    this.redisCacheService
      .set(cacheKeys.USER_DASHBOARD.COURSE_DISCOVERY, courseDiscoveries, {
        ttl: 86400,
      })
      .catch((err) => this.logger.error('Error caching COURSE_DISCOVERY', err));
    return courseDiscoveries;
  }

  async saveCourseDiscovery(dto: SaveCourseDiscoveryDto) {
    await this.courseDiscoveryRepo.delete({});
    await this.redisCacheService
      .del(cacheKeys.USER_DASHBOARD.COURSE_DISCOVERY)
      .catch((err) =>
        this.logger.error('Error deleting cache for COURSE_DISCOVERY', err),
      );

    await Promise.all(
      [
        { dtoCourses: dto.highlights, type: CourseDiscoveryType.HIGHLIGHT },
        { dtoCourses: dto.popular, type: CourseDiscoveryType.POPULAR },
        { dtoCourses: dto.newReleases, type: CourseDiscoveryType.NEW_RELEASE },
      ].map(async ({ dtoCourses, type }) => {
        const courses = dtoCourses.map((id, sequence) =>
          this.courseDiscoveryRepo.create({
            course: { id },
            sequence,
            type,
          }),
        );
        await this.courseDiscoveryRepo.save(courses);
      }),
    );
  }
}
