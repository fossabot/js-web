import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import {
  getPaginationRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { cacheKeys } from '@seaccentral/core/dist/redis/cacheKeys';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { RedisCacheService } from '@seaccentral/core/dist/redis/redisCache.service';
import { LearningTrack } from '@seaccentral/core/dist/learning-track/LearningTrack.entity';
import { UserArchivedLearningTrack } from '@seaccentral/core/dist/learning-track/UserArchivedLearningTrack.entity';
import { UserEnrolledLearningTrack } from '@seaccentral/core/dist/learning-track/UserEnrolledLearningTrack.entity';
import { UserEnrolledLearningTrackStatus } from '@seaccentral/core/dist/learning-track/UserEnrolledLearningTrackStatus.enum';

import { GetAllEnrolledLearningTracksQueryDto } from './dto/GetAllEnrolledLearningTracksQuery.dto';

@Injectable()
export class UserLearningTrackService {
  private logger = new Logger(UserLearningTrackService.name);

  constructor(
    @InjectRepository(LearningTrack)
    private learningTrackRepository: Repository<LearningTrack>,
    @InjectRepository(UserArchivedLearningTrack)
    private userArchivedLearningTrackRepository: Repository<UserArchivedLearningTrack>,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async getAllEnrolledLearningTracks(
    user: User,
    dto: GetAllEnrolledLearningTracksQueryDto,
    languageCode: LanguageCode,
  ) {
    const { skip, take } = getPaginationRequestParams(dto);
    const { orderBy } = getSortRequestParams(dto);
    const { topicId, learningWayId, status } = dto;

    const lang = languageCode === LanguageCode.EN ? 'En' : 'Th';

    let learningTrackQuery = this.learningTrackRepository
      .createQueryBuilder('lt')
      .innerJoin(
        'lt.userEnrolledLearningTrack',
        'userEnrolledLearningTrack',
        'userEnrolledLearningTrack.isActive = :isActive AND userEnrolledLearningTrack.userId = :userId',
      )
      .leftJoin('lt.title', 'title')
      .leftJoin('lt.tagLine', 'tagLine')
      .leftJoin('lt.category', 'category')
      .leftJoin('lt.learningTrackTopic', 'learningTrackTopic')
      .leftJoin(
        'lt.learningTrackSection',
        'learningTrackSection',
        'learningTrackSection.isActive = :isActive',
      )
      .leftJoin(
        'learningTrackSection.learningTrackSectionCourse',
        'learningTrackSectionCourse',
        'learningTrackSectionCourse.isActive = :isActive',
      )
      .leftJoin(
        'learningTrackSectionCourse.course',
        'course',
        'course.isActive = :isActive',
      )
      .leftJoin(
        'course.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
      )
      .leftJoin(
        (subQuery) =>
          subQuery
            .from(UserEnrolledLearningTrack, 'userEnrolledLearningTrack')
            .innerJoin(
              'userEnrolledLearningTrack.learningTrack',
              'learningTrack',
              'learningTrack.isActive = :isActive',
            )
            .innerJoin(
              'learningTrack.learningTrackSection',
              'learningTrackSection',
              'learningTrackSection.isActive = :isActive',
            )
            .innerJoin(
              'learningTrackSection.learningTrackSectionCourse',
              'learningTrackSectionCourse',
            )
            .innerJoin(
              'learningTrackSectionCourse.course',
              'course',
              'course.isActive = :isActive',
            )
            .leftJoin(
              'course.userEnrolledCourse',
              'userEnrolledCourse',
              'userEnrolledCourse.isActive = :isActive AND userEnrolledCourse.userId = :userId',
            )
            .select('learningTrack.id', 'learning_track_id')
            .addSelect(
              'CEIL(AVG(COALESCE("userEnrolledCourse"."percentage", 0)))',
              'percentage',
            )
            .groupBy('learningTrack.id')
            .where(
              'userEnrolledLearningTrack.isActive = :isActive AND userEnrolledLearningTrack.userId = :userId',
            )
            .setParameters({
              isActive: true,
              userId: user.id,
            }),
        'progress',
        'progress.learning_track_id = lt.id',
      )
      .leftJoin(
        'lt.userArchivedLearningTrack',
        'userArchivedLearningTrack',
        'userArchivedLearningTrack.isActive = :isActive AND userArchivedLearningTrack.userId = :userId',
      )
      .leftJoin(
        'lt.userAssignedLearningTrack',
        'userAssignedLearningTrack',
        'userAssignedLearningTrack.userId = :userId',
      )
      .leftJoin('courseOutline.category', 'subCategory')
      .leftJoin('courseOutline.learningWay', 'learningWay')
      .select('lt.id', 'id')
      .select('userAssignedLearningTrack.dueDateTime', 'dueDateTime')
      .addSelect('userEnrolledLearningTrack.status', 'status')
      .groupBy('lt.id')
      .addGroupBy('userEnrolledLearningTrack.status')
      .addGroupBy('userAssignedLearningTrack.dueDateTime')
      .where('lt.isActive = :isActive')
      .setParameters({
        userId: user.id,
        isActive: true,
      });

    if (topicId) {
      learningTrackQuery = learningTrackQuery.andWhere(
        'learningTrackTopic.topicId = :topicId',
        {
          topicId,
        },
      );
    }

    if (learningWayId) {
      learningTrackQuery = learningTrackQuery.andWhere(
        'learningWay.id = :learningWayId',
        {
          learningWayId,
        },
      );
    }

    if (status) {
      if (
        [
          UserEnrolledLearningTrackStatus.ENROLLED,
          UserEnrolledLearningTrackStatus.IN_PROGRESS,
          UserEnrolledLearningTrackStatus.COMPLETED,
        ].includes(status)
      ) {
        learningTrackQuery = learningTrackQuery
          .andWhere('userEnrolledLearningTrack.status = :status', { status })
          .having('COUNT(userArchivedLearningTrack.learningTrackId) < 1');
      } else if (status === UserEnrolledLearningTrackStatus.ARCHIVED) {
        learningTrackQuery = learningTrackQuery.having(
          'COUNT(userArchivedLearningTrack.learningTrackId) > 0',
        );
      }

      learningTrackQuery = learningTrackQuery.addGroupBy(
        'userEnrolledLearningTrack.status',
      );
    }

    const totalRows = await learningTrackQuery.getRawMany();
    const count = totalRows.length;

    learningTrackQuery = learningTrackQuery
      .offset(skip)
      .limit(take)
      .addSelect('lt.imageKey', 'imageKey')
      .addSelect(`title.name${lang}`, 'title')
      .addSelect(`tagLine.name${lang}`, 'tagLine')
      .addSelect('lt.durationMonths', 'durationMonths')
      .addSelect('lt.durationWeeks', 'durationWeeks')
      .addSelect('lt.durationDays', 'durationDays')
      .addSelect('lt.durationHours', 'durationHours')
      .addSelect('lt.durationMinutes', 'durationMinutes')
      .addSelect(
        'userAssignedLearningTrack.assignmentType',
        'userAssignedLearningTrackType',
      )
      .addSelect('COALESCE(category.key)', 'categoryKey')
      .addSelect(
        'CAST(COUNT(learningTrackSectionCourse.courseId) AS INTEGER)',
        'courseLength',
      )
      .addSelect(
        'CAST(CEIL(AVG(progress.percentage)) AS INTEGER)',
        'averagePercentage',
      )
      .addSelect(
        (qb) =>
          qb
            .select('COUNT(ualt.id) > 0', 'isArchived')
            .from(UserArchivedLearningTrack, 'ualt')
            .where(
              'ualt.learningTrackId = lt.id AND ualt.userId = :userId AND ualt.isActive = :isActive',
            )
            .limit(1),
        'isArchived',
      )
      .addSelect('lt.id', 'id')
      .addGroupBy(`title.name${lang}`)
      .addGroupBy(`tagLine.name${lang}`)
      .addGroupBy('userAssignedLearningTrack.assignmentType')
      .addGroupBy('userAssignedLearningTrack.updatedAt')
      .addGroupBy('userEnrolledLearningTrack.createdAt')
      .addGroupBy('category.key');

    if (orderBy === 'title') {
      learningTrackQuery = learningTrackQuery.orderBy(
        `title.name${lang}`,
        'ASC',
      );
    } else if (orderBy === 'assignedLearningTrack') {
      learningTrackQuery = learningTrackQuery
        .orderBy(
          'userAssignedLearningTrack.assignmentType',
          'DESC',
          'NULLS LAST',
        )
        .addOrderBy(
          'userAssignedLearningTrack.updatedAt',
          'DESC',
          'NULLS LAST',
        );
    } else {
      learningTrackQuery = learningTrackQuery
        .orderBy('userEnrolledLearningTrack.createdAt', 'DESC')
        .addOrderBy('lt.createdAt', 'DESC');
    }

    const learningTracks = await learningTrackQuery.getRawMany();

    return { learningTracks, count };
  }

  async getAllEnrolledLearningTrackStatuses(
    user: User,
    dto: GetAllEnrolledLearningTracksQueryDto,
  ) {
    const { topicId, learningWayId } = dto;

    const cacheKey = cacheKeys.USER_DASHBOARD.LEARNING_TRACKS_STATS.replace(
      '$userId',
      user.id,
    )
      .replace('$topicId', topicId || '')
      .replace('$learningWayId', learningWayId || '');
    const cachedStats = await this.redisCacheService.get(cacheKey);

    if (cachedStats) return cachedStats;

    let learningTrackQuery = this.learningTrackRepository
      .createQueryBuilder('lt')
      .innerJoin(
        'lt.userEnrolledLearningTrack',
        'userEnrolledLearningTrack',
        'userEnrolledLearningTrack.isActive = :isActive AND userEnrolledLearningTrack.userId = :userId',
      )
      .leftJoin(
        'lt.userArchivedLearningTrack',
        'userArchivedLearningTrack',
        'userArchivedLearningTrack.isActive = :isActive AND userArchivedLearningTrack.userId = :userId',
      )
      .select('lt.id', 'learning_track_id')
      .addSelect('userEnrolledLearningTrack.status', 'status')
      .having('COUNT(userArchivedLearningTrack.learningTrackId) < 1')
      .groupBy('lt.id')
      .addGroupBy('userEnrolledLearningTrack.status')
      .setParameters({
        userId: user.id,
        isActive: true,
      });

    if (topicId) {
      learningTrackQuery = learningTrackQuery
        .leftJoin(
          'lt.learningTrackTopic',
          'learningTrackTopic',
          'learningTrackTopic.isActive = :isActive',
        )
        .leftJoin(
          'learningTrackTopic.topic',
          'topic',
          'topic.isActive = :isActive',
        )
        .andWhere('topic.id = :topicId', {
          topicId,
        });
    }

    if (learningWayId) {
      learningTrackQuery = learningTrackQuery
        .leftJoin(
          'lt.learningTrackSection',
          'learningTrackSection',
          'learningTrackSection.isActive = :isActive',
        )
        .leftJoin(
          'learningTrackSection.learningTrackSectionCourse',
          'learningTrackSectionCourse',
          'learningTrackSectionCourse.isActive = :isActive',
        )
        .leftJoin(
          'learningTrackSectionCourse.course',
          'course',
          'course.isActive = :isActive',
        )
        .leftJoin(
          'course.courseOutline',
          'courseOutline',
          'courseOutline.isActive = :isActive',
        )
        .where('lt.isActive = :isActive')
        .setParameters({
          userId: user.id,
          isActive: true,
        })
        .leftJoin(
          'courseOutline.learningWay',
          'learningWay',
          'learningWay.isActive = :isActive',
        )
        .andWhere('learningWay.id = :learningWayId', {
          learningWayId,
        });
    }

    const learningTracks = await learningTrackQuery.getRawMany<{
      status: UserEnrolledLearningTrackStatus;
      learning_track_id: string;
    }>();

    const countArchived = await this.countArchivedLearningTracks(
      user,
      topicId,
      learningWayId,
    );

    const data = {
      notStarted: learningTracks.filter(
        (lt) => lt.status === UserEnrolledLearningTrackStatus.ENROLLED,
      ).length,
      inProgress: learningTracks.filter(
        (lt) => lt.status === UserEnrolledLearningTrackStatus.IN_PROGRESS,
      ).length,
      completed: learningTracks.filter(
        (lt) => lt.status === UserEnrolledLearningTrackStatus.COMPLETED,
      ).length,
      archived: countArchived,
    };

    this.redisCacheService
      .set(cacheKey, data, { ttl: 30 })
      .catch((err) =>
        this.logger.error('Error caching LEARNING_TRACKS_STATS', err),
      );

    return data;
  }

  countArchivedLearningTracks(
    user: User,
    topicId?: string,
    learningWayId?: string,
  ) {
    let query = this.userArchivedLearningTrackRepository
      .createQueryBuilder('archivedLearningTrack')
      .innerJoin(
        'archivedLearningTrack.learningTrack',
        'learningTrack',
        'learningTrack.isActive = :isActive',
      )
      .innerJoin(
        'archivedLearningTrack.user',
        'user',
        'user.isActive = :isActive',
      )
      .where('archivedLearningTrack.isActive = :isActive')
      .andWhere('archivedLearningTrack.userId = :userId')
      .setParameters({
        userId: user.id,
        isActive: true,
      });

    if (topicId) {
      query = query
        .leftJoin(
          'learningTrack.learningTrackTopic',
          'learningTrackTopic',
          'learningTrackTopic.isActive = :isActive',
        )
        .leftJoin(
          'learningTrackTopic.topic',
          'topic',
          'topic.isActive = :isActive',
        )
        .andWhere('topic.id = :topicId', {
          topicId,
        });
    }

    if (learningWayId) {
      query = query
        .leftJoin(
          'learningTrack.learningTrackSection',
          'learningTrackSection',
          'learningTrackSection.isActive = :isActive',
        )
        .leftJoin(
          'learningTrackSection.learningTrackSectionCourse',
          'learningTrackSectionCourse',
        )
        .leftJoin(
          'learningTrackSectionCourse.course',
          'course',
          'course.isActive = :isActive',
        )
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

  async isLearningTrackExists(learningTrackId: string) {
    const count = await this.learningTrackRepository.count({
      id: learningTrackId,
    });
    return count > 0;
  }

  async addArchiveLearningTrack(learningTrackId: string, user: User) {
    const exists = await this.isLearningTrackExists(learningTrackId);
    if (!exists)
      throw new HttpException(
        'Learning Track not found.',
        HttpStatus.NOT_FOUND,
      );

    return this.userArchivedLearningTrackRepository.save({
      learningTrack: { id: learningTrackId },
      user,
      isActive: true,
    });
  }

  async removeArchiveLearningTrack(learningTrackId: string, user: User) {
    const exists = await this.isLearningTrackExists(learningTrackId);
    if (!exists)
      throw new HttpException(
        'Learning Track not found.',
        HttpStatus.NOT_FOUND,
      );

    await this.userArchivedLearningTrackRepository.delete({
      learningTrack: { id: learningTrackId },
      user,
    });
  }
}
