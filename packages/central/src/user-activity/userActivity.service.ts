import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEnrolledCourse } from '@seaccentral/core/dist/course/UserEnrolledCourse.entity';
import { UserEnrolledLearningTrack } from '@seaccentral/core/dist/learning-track/UserEnrolledLearningTrack.entity';
import {
  getPaginationRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { Repository } from 'typeorm';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';

@Injectable()
export default class UserActivityService {
  constructor(
    @InjectRepository(UserEnrolledCourse)
    private readonly userEnrolledCourseRepository: Repository<UserEnrolledCourse>,
    @InjectRepository(UserEnrolledLearningTrack)
    private readonly userEnrolledLearningTrackRepository: Repository<UserEnrolledLearningTrack>,
  ) {}

  async getAllUserEnrolledCourses(dto: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(dto);
    const { order, orderBy } = getSortRequestParams(dto);
    let query = this.userEnrolledCourseRepository
      .createQueryBuilder('userEnrolledCourse')
      .innerJoinAndSelect(
        'userEnrolledCourse.user',
        'user',
        'user.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'userEnrolledCourse.course',
        'course',
        'course.isActive = :isActive',
      )
      .leftJoinAndSelect('course.title', 'title')
      .leftJoinAndSelect(
        'course.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'course.category',
        'category',
        'category.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'courseOutline.learningWay',
        'learningWay',
        'learningWay.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'courseOutline.category',
        'subCategory',
        'subCategory.isActive = :isActive',
      )
      .orderBy('userEnrolledCourse.createdAt', 'DESC')
      .setParameters({
        isActive: true,
        search: dto.search ? `%${dto.search}%` : '',
      });

    if (dto.search && dto.searchField) {
      if (dto.searchField === 'username' || dto.searchField === 'email') {
        query = query.andWhere('user.email ILIKE :search');
      } else if (
        dto.searchField === 'firstName' ||
        dto.searchField === 'lastName'
      ) {
        query = query.andWhere(`user.${dto.searchField} ILIKE :search`);
      } else if (dto.searchField === 'title') {
        query = query.andWhere(
          'title.nameEn ILIKE :search OR title.nameTh ILIKE :search',
        );
      }
    }

    if (orderBy === 'createdAt') {
      query = query.orderBy('userEnrolledCourse.createdAt', order || 'DESC');
    }

    const courses = await query.skip(skip).take(take).getMany();

    const count = await query.getCount();

    return { courses, count };
  }

  async getAllUserEnrolledLearningTracks(dto: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(dto);
    let query = this.userEnrolledLearningTrackRepository
      .createQueryBuilder('userEnrolledLearningTrack')
      .innerJoinAndSelect(
        'userEnrolledLearningTrack.user',
        'user',
        'user.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'userEnrolledLearningTrack.learningTrack',
        'learningTrack',
        'learningTrack.isActive = :isActive',
      )
      .leftJoinAndSelect('learningTrack.title', 'title')
      .leftJoinAndSelect(
        'learningTrack.learningTrackSection',
        'learningTrackSection',
        'learningTrackSection.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'learningTrackSection.learningTrackSectionCourse',
        'learningTrackSectionCourse',
      )
      .leftJoinAndSelect('learningTrackSectionCourse.course', 'course')
      .leftJoinAndSelect(
        'learningTrack.category',
        'category',
        'category.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'course.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'courseOutline.learningWay',
        'learningWay',
        'learningWay.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'courseOutline.category',
        'subCategory',
        'subCategory.isActive = :isActive',
      )
      .orderBy('userEnrolledLearningTrack.createdAt', 'DESC')
      .setParameters({
        isActive: true,
        search: dto.search ? `%${dto.search}%` : '',
      });

    if (dto.search && dto.searchField) {
      if (dto.searchField === 'username' || dto.searchField === 'email') {
        query = query.andWhere('user.email ILIKE :search');
      } else if (
        dto.searchField === 'firstName' ||
        dto.searchField === 'lastName'
      ) {
        query = query.andWhere(`user.${dto.searchField} ILIKE :search`);
      } else if (dto.searchField === 'title') {
        query = query.andWhere(
          'title.nameEn ILIKE :search OR title.nameTh ILIKE :search',
        );
      }
    }

    const learningTracks = await query.skip(skip).take(take).getMany();

    const count = await query.getCount();

    return { learningTracks, count };
  }
}
