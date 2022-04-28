import { Injectable, NotFoundException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { CourseOutlineMediaPlayList } from '@seaccentral/core/dist/course/CourseOutlineMediaPlaylist.entity';
import { UserCourseOutlineProgress } from '@seaccentral/core/dist/course/UserCourseOutlineProgress.entity';
import { UserCourseOutlineProgressStatus } from '@seaccentral/core/dist/course/UserCourseOutlineProgressStatus.enum';
import { UserVideoCourseOutlineMetadata } from '@seaccentral/core/dist/course/UserVideoCourseOutlineMetadata.entity';
import { Media, MediaStatus } from '@seaccentral/core/dist/media/media.entity';
import { ScormVersion } from '@seaccentral/core/dist/scorm/ScormVersion.enum';
import { UserScormMetadata } from '@seaccentral/core/dist/scorm/UserScormMetadata.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import {
  getPaginationRequestParams,
  getSearchRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { Repository } from 'typeorm';
import { ScormService } from '../scorm/scorm.service';
import { CourseOutlineQueryDto } from './dto/CourseOutlineQuery.dto';
import { UserScormProgressDto } from './dto/UserScormProgress.dto';
import { UserVideoProgressDto } from './dto/UserVideoProgress.dto';

@Injectable()
export class CourseOutlineService extends TransactionFor<CourseOutlineService> {
  constructor(
    @InjectRepository(CourseOutline)
    private courseOutlineRepository: Repository<CourseOutline>,
    @InjectRepository(UserCourseOutlineProgress)
    private userCourseOutlineProgressRepository: Repository<UserCourseOutlineProgress>,
    @InjectRepository(UserScormMetadata)
    private userScormMetadataRepository: Repository<UserScormMetadata>,
    @InjectRepository(UserVideoCourseOutlineMetadata)
    private userVideoCourseOutlineMetadataRepository: Repository<UserVideoCourseOutlineMetadata>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(CourseOutlineMediaPlayList)
    private courseOutlineMediaPlayListRepository: Repository<CourseOutlineMediaPlayList>,
    private scormService: ScormService,

    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async findAll(query: CourseOutlineQueryDto) {
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const qb = this.courseOutlineRepository
      .createQueryBuilder('courseOutline')
      .leftJoinAndSelect('courseOutline.title', 'title')
      .leftJoinAndSelect('courseOutline.category', 'category')
      .leftJoinAndSelect('courseOutline.course', 'course')
      .leftJoinAndSelect('course.title', 'courseTitle')
      .leftJoinAndSelect('course.category', 'courseCategory')
      .where('"courseOutline"."isActive" = :isActive', { isActive: true })
      .andWhere('"course"."isActive" = :isActive', { isActive: true })
      .orderBy(`courseOutline.${orderBy}`, order || 'ASC');

    if (search && searchField) {
      if (searchField === 'courseCategoryKey') {
        qb.andWhere('"courseCategory".key = :search', {
          search,
        });
      } else if (searchField === 'title') {
        qb.andWhere('(title.nameEn ILIKE :name OR title.nameTh ILIKE :name)', {
          name: `%${search}%`,
        });
      } else {
        qb.andWhere(`courseOutline.${searchField} ILIKE :search`, {
          search: `%${search}%`,
        });
      }
    }

    const count = await qb.getCount();
    const data = await qb.skip(skip).take(take).getMany();

    if (query.id && !data.some((co) => co.id === query.id)) {
      const specificCourseOutline = await qb
        .andWhere('courseOutline.id = :id', { id: query.id })
        .getOne();
      if (specificCourseOutline) {
        data.unshift(specificCourseOutline);
      }
    }

    return { data, count };
  }

  async updateScormProgress(
    learningContentId: string,
    userScormProgressDto: UserScormProgressDto,
    user: User,
  ) {
    const courseOutline = await this.courseOutlineRepository.findOne({
      where: { learningContentFile: { id: learningContentId } },
    });

    if (!courseOutline) throw new NotFoundException('Invalid courseOutlineId');

    const {
      suspend_data,
      location,
      metadata,
      version,
      status: scormStatus,
    } = userScormProgressDto;

    const { percentage, status } =
      this.scormService.scormMetadataToOutlineProgress(userScormProgressDto);

    const userCourseOutlineProgress =
      await this.getUserProgressByCourseOutlineId(courseOutline.id, user);

    if (
      userCourseOutlineProgress.percentage !== 100 &&
      userCourseOutlineProgress.percentage !== percentage
    )
      await this.userCourseOutlineProgressRepository.update(
        { id: userCourseOutlineProgress.id },
        {
          percentage,
          status,
        },
      );

    const userScormProgress = await this.userScormMetadataRepository.findOne({
      where: {
        userCourseOutlineProgress: { id: userCourseOutlineProgress.id },
      },
    });

    await this.userScormMetadataRepository.update(
      { id: userScormProgress!.id },
      {
        version: version as ScormVersion,
        suspend_data,
        status: scormStatus,
        location,
        metadata,
      },
    );
  }

  async getAllVideoByCourseOutline(courseOutlineId: string) {
    const query = this.courseOutlineMediaPlayListRepository
      .createQueryBuilder('outlineMediaPlaylist')
      .innerJoinAndSelect(
        'outlineMediaPlaylist.media',
        'media',
        'media.isActive = :isActive',
      )
      .where(
        'outlineMediaPlaylist.isActive = :isActive AND outlineMediaPlaylist.courseOutlineId = :courseOutlineId AND media.status = :mediaStatus',
      )
      .setParameters({
        courseOutlineId,
        isActive: true,
        mediaStatus: MediaStatus.Available,
      })
      .addOrderBy('outlineMediaPlaylist.sequence', 'ASC');

    const outlineMediaPlaylist = await query.getMany();
    return outlineMediaPlaylist.map((it) => it.media);
  }

  async getUserProgressByCourseOutlineId(id: string, user: User) {
    const userCourseOutlineProgress =
      await this.userCourseOutlineProgressRepository.findOne({
        where: {
          courseOutline: { id },
          user: { id: user.id },
          isActive: true,
        },
      });

    if (!userCourseOutlineProgress)
      throw new NotFoundException('User progress not found.');

    return userCourseOutlineProgress;
  }

  async createUserCourseOutlineProgress(learningContentId: string, user: User) {
    const courseOutline = await this.courseOutlineRepository.findOne({
      where: { learningContentFile: { id: learningContentId } },
    });

    if (!courseOutline)
      throw new NotFoundException('Course outline not found.');

    return this.userCourseOutlineProgressRepository.save({
      status: UserCourseOutlineProgressStatus.ENROLLED,
      percentage: 0,
      user,
      courseOutline,
    });
  }

  async createUserScormMetadata(
    userCourseOutlineProgress: UserCourseOutlineProgress,
  ) {
    return this.userScormMetadataRepository.save({
      userCourseOutlineProgress,
    });
  }

  // TODO: Get courseOutlineId from temporary token or cookies
  async findScormProgressById(learningContentid: string, user: User) {
    const courseOutline = await this.courseOutlineRepository.findOne({
      where: { learningContentFile: { id: learningContentid } },
    });

    if (!courseOutline) throw new NotFoundException('CourseOutline not found');

    let userCourseOutlineProgress =
      await this.userCourseOutlineProgressRepository.findOne({
        where: {
          user: { id: user.id },
          courseOutline: { id: courseOutline.id },
          isActive: true,
        },
      });

    if (!userCourseOutlineProgress)
      userCourseOutlineProgress = await this.createUserCourseOutlineProgress(
        learningContentid,
        user,
      );

    let userScormProgress = await this.userScormMetadataRepository.findOne({
      where: {
        userCourseOutlineProgress: { id: userCourseOutlineProgress.id },
      },
    });

    if (!userScormProgress)
      userScormProgress = await this.createUserScormMetadata(
        userCourseOutlineProgress,
      );

    return { userScormProgress, courseOutlineId: courseOutline.id };
  }

  private async prepareUserVideoLearningProgress(
    courseOutlineId: string,
    user: User,
  ) {
    const countCourseOutline = await this.courseOutlineRepository.count({
      where: { id: courseOutlineId, isActive: true },
    });
    if (countCourseOutline < 1)
      throw new NotFoundException('Invalid courseOutlineId');

    // Get all videos in current playlist for calculation.
    const allVideos = await this.getAllVideoByCourseOutline(courseOutlineId);

    // Get user's course outline progress for reference and update later.
    const userProgressCriteria = {
      courseOutline: { id: courseOutlineId },
      user: { id: user.id },
    };
    let userCourseOutlineProgress =
      await this.userCourseOutlineProgressRepository.findOne(
        userProgressCriteria,
      );
    if (!userCourseOutlineProgress) {
      userCourseOutlineProgress =
        await this.userCourseOutlineProgressRepository.save({
          ...userProgressCriteria,
          percentage: 0,
          status: UserCourseOutlineProgressStatus.IN_PROGRESS,
          isActive: true,
        });
    }

    // Get exists or create new video progress metadata for record recently seen video and store personal progress for all videos.
    let videoProgressMetadata =
      await this.userVideoCourseOutlineMetadataRepository.findOne({
        userCourseOutlineProgress: { id: userCourseOutlineProgress.id },
      });
    if (!videoProgressMetadata) {
      videoProgressMetadata =
        this.userVideoCourseOutlineMetadataRepository.create({
          userCourseOutlineProgress: { id: userCourseOutlineProgress.id },
          lastDuration: 0,
          isActive: true,
          videoProgress: [],
        });
    }

    // Sync video metadata with actual playlist videos to make sure the list is up-to-date.
    const oldMetadata = videoProgressMetadata.videoProgress;
    const newMetadata = allVideos.map((video) => {
      const selectedMetadata = oldMetadata.find((it) => it.id === video.id);
      return (
        selectedMetadata || {
          id: video.id,
          spentDuration: 0,
          totalDuration: video.duration,
          percentage: 0,
        }
      );
    });

    videoProgressMetadata.videoProgress = newMetadata;

    return {
      userCourseOutlineProgress,
      videoProgressMetadata,
      metadata: newMetadata,
    };
  }

  async getVideoLearningProgress(courseOutlineId: string, user: User) {
    return this.prepareUserVideoLearningProgress(courseOutlineId, user);
  }

  async updateVideoProgress(
    courseOutlineId: string,
    userVideoProgressDto: UserVideoProgressDto,
    user: User,
  ) {
    const { mediaId, spentDuration } = userVideoProgressDto;

    const { userCourseOutlineProgress, videoProgressMetadata, metadata } =
      await this.prepareUserVideoLearningProgress(courseOutlineId, user);

    // Assign last seen video
    videoProgressMetadata.lastDuration = spentDuration;
    videoProgressMetadata.lastVideo = this.mediaRepository.create({
      id: mediaId,
    });

    // Update the current video in metadata
    const videoMetadata = metadata.find((it) => it.id === mediaId);
    if (videoMetadata && videoMetadata.percentage < 100) {
      videoMetadata.spentDuration = spentDuration;

      let newPercent = Math.round(
        (Math.ceil(videoMetadata.spentDuration) / videoMetadata.totalDuration) *
          100,
      );

      if (newPercent >= 100) newPercent = 100;

      if (newPercent > videoMetadata.percentage)
        videoMetadata.percentage = newPercent;

      // If current video progress is 100 percent, assign next video as last seen video.
      if (videoMetadata.percentage >= 100) {
        const index = metadata.indexOf(videoMetadata);
        if (index < metadata.length - 1) {
          const nextVideo = metadata[index + 1];
          videoProgressMetadata.lastDuration = nextVideo.spentDuration;
          videoProgressMetadata.lastVideo = this.mediaRepository.create({
            id: nextVideo.id,
          });
        }
      }
    }

    // Save video metadata.
    await this.userVideoCourseOutlineMetadataRepository.save(
      videoProgressMetadata,
    );

    // Calculate progress for entire playlist of course outline.
    if (metadata.length > 0) {
      let newPercentage = Math.round(
        metadata
          .map((it) => it.percentage)
          .reduce((prev, next) => prev + next, 0) / metadata.length,
      );
      if (newPercentage > 100) newPercentage = 100;

      // Only update if new percentage > old percentage
      if (newPercentage > userCourseOutlineProgress.percentage) {
        userCourseOutlineProgress.percentage = newPercentage;
        userCourseOutlineProgress.status =
          newPercentage < 100
            ? UserCourseOutlineProgressStatus.IN_PROGRESS
            : UserCourseOutlineProgressStatus.COMPLETED;
      }
    }

    await this.userCourseOutlineProgressRepository.save(
      userCourseOutlineProgress,
    );
    return userCourseOutlineProgress;
  }
}
