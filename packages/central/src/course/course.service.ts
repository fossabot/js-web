import { chunk, uniq } from 'lodash';
import flatten from 'lodash/flatten';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, TreeRepository } from 'typeorm';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import {
  CourseRuleItem,
  CourseRuleType,
} from '@seaccentral/core/dist/course/CourseRuleItem.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Topic } from '@seaccentral/core/dist/topic/Topic.entity';
import { Course } from '@seaccentral/core/dist/course/Course.entity';
import { MediaStatus } from '@seaccentral/core/dist/media/media.entity';
import { CourseTag } from '@seaccentral/core/dist/course/CourseTag.entity';
import { Language } from '@seaccentral/core/dist/language/Language.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { CourseTopic } from '@seaccentral/core/dist/course/CourseTopic.entity';
import { CourseStatus } from '@seaccentral/core/dist/course/courseStatus.enum';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { CourseSession } from '@seaccentral/core/dist/course/CourseSession.entity';
import { CourseCategory } from '@seaccentral/core/dist/course/CourseCategory.entity';
import { CourseMaterial } from '@seaccentral/core/dist/course/CourseMaterial.entity';
import { LearningWay } from '@seaccentral/core/dist/learning-way/LearningWay.entity';
import { CourseSubCategory } from '@seaccentral/core/dist/course/CourseSubCategory.entity';
import { UserEnrolledCourse } from '@seaccentral/core/dist/course/UserEnrolledCourse.entity';
import { UserAssignedCourse } from '@seaccentral/core/dist/course/UserAssignedCourse.entity';
import { CourseSessionInstructor } from '@seaccentral/core/dist/course/CourseSessionInstructor.entity';
import { UserEnrolledCourseStatus } from '@seaccentral/core/dist/course/UserEnrolledCourseStatus.enum';
import { UserCourseOutlineProgress } from '@seaccentral/core/dist/course/UserCourseOutlineProgress.entity';
import { CourseOutlineMediaPlayList } from '@seaccentral/core/dist/course/CourseOutlineMediaPlaylist.entity';
import { CourseSessionUploadHistory } from '@seaccentral/core/dist/course/CourseSessionUploadHistory.entity';
import { CourseAccessCheckerService } from '@seaccentral/core/dist/course/courseAccessCheckerService.service';
import { LearningContentFile } from '@seaccentral/core/dist/learning-content-file/LearningContentFile.entity';
import { UserCourseOutlineProgressStatus } from '@seaccentral/core/dist/course/UserCourseOutlineProgressStatus.enum';
import { UserVideoCourseOutlineMetadata } from '@seaccentral/core/dist/course/UserVideoCourseOutlineMetadata.entity';
import { CertificateUnlockRuleCourseItem } from '@seaccentral/core/dist/certificate/CertificateUnlockRuleCourseItem.entity';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { NotificationVariableDict as NV } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';

import {
  CreateCourseBody,
  CreateCourseOutlineBody,
  CreateCourseSessionBody,
  UpdateCourseBody,
  UpdateCourseOutlineBody,
} from './dto/Course.dto';
import { CourseQueryDto } from './dto/CourseQuery.dto';
import { CourseSearchService } from './courseSearch.service';
import { CourseSearchQueryDto } from './dto/CourseSearchQuery.dto';

@Injectable()
export class CourseService extends TransactionFor<CourseService> {
  @Inject(CourseSearchService)
  private courseSearchService: CourseSearchService;

  @Inject(CourseAccessCheckerService)
  private courseAccessCheckerService: CourseAccessCheckerService;

  constructor(
    private readonly notificationProducer: NotificationProducer,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(LearningWay)
    private learningWayRepository: TreeRepository<LearningWay>,
    @InjectRepository(Topic)
    private topicRepository: TreeRepository<Topic>,
    @InjectRepository(CourseTag)
    private courseTagRepository: Repository<CourseTag>,
    @InjectRepository(CourseMaterial)
    private courseMaterialRepository: Repository<CourseMaterial>,
    @InjectRepository(CourseTopic)
    private courseTopicRepository: Repository<CourseTopic>,
    @InjectRepository(CourseOutline)
    private courseOutlineRepository: Repository<CourseOutline>,
    @InjectRepository(CourseSession)
    private courseSessionRepository: Repository<CourseSession>,
    @InjectRepository(CourseSessionInstructor)
    private courseSessionInstructorRepository: Repository<CourseSessionInstructor>,
    @InjectRepository(CourseOutlineMediaPlayList)
    private courseOutlineMediaPlayListRepository: Repository<CourseOutlineMediaPlayList>,
    @InjectRepository(CourseCategory)
    private courseCategoryRepository: Repository<CourseCategory>,
    @InjectRepository(CourseSubCategory)
    private courseSubCategoryRepository: Repository<CourseSubCategory>,
    @InjectRepository(LearningContentFile)
    private learningContentFileRepository: Repository<LearningContentFile>,
    @InjectRepository(CourseSessionUploadHistory)
    private courseSessionUploadHistoryRepository: Repository<CourseSessionUploadHistory>,
    @InjectRepository(UserEnrolledCourse)
    private userEnrolledCourseRepository: Repository<UserEnrolledCourse>,
    @InjectRepository(UserCourseOutlineProgress)
    private userCourseOutlineProgressRepository: Repository<UserCourseOutlineProgress>,
    @InjectRepository(CourseRuleItem)
    private courseRuleItemRepository: Repository<CourseRuleItem>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(UserVideoCourseOutlineMetadata)
    private userVideoCourseOutlineMetadataRepository: Repository<UserVideoCourseOutlineMetadata>,
    @InjectRepository(CertificateUnlockRuleCourseItem)
    private certificateUnlockRuleCourseItemRepository: Repository<CertificateUnlockRuleCourseItem>,
    @InjectRepository(UserAssignedCourse)
    private userAssignedCourseRepository: Repository<UserAssignedCourse>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async search(
    query: CourseSearchQueryDto,
    skip: number,
    take: number,
    user: User,
  ): Promise<{
    data: Course[];
    count: number;
    certificateDict: { [key: string]: boolean };
  }> {
    const certificateDict: { [key: string]: boolean } = {};
    let filter = [];
    if (query.type === 'topic') {
      const topic = await this.topicRepository.findOne(query.id);
      if (!topic) {
        return {
          data: [],
          certificateDict,
          count: 0,
        };
      }
      const tDesc = await this.topicRepository.findDescendants(topic);
      filter = tDesc.length > 0 ? tDesc : [topic];
    } else {
      const learningWay = await this.learningWayRepository.findOne(query.id);
      if (!learningWay) {
        return {
          data: [],
          certificateDict,
          count: 0,
        };
      }
      const lwDesc = await this.learningWayRepository.findDescendants(
        learningWay,
      );
      filter = lwDesc.length > 0 ? lwDesc : [learningWay];
    }

    const subscribedOnly =
      await this.courseAccessCheckerService.shouldOnlyShowSubscribedCourses(
        user,
      );

    let filterIds: string[] = [];

    if (subscribedOnly) {
      filterIds = await this.courseAccessCheckerService.getSubscribedCourseIds(
        user,
      );
    }

    if (query.assignmentType) {
      const userAssignedCourses = await this.userAssignedCourseRepository.find({
        where: { userId: user.id, assignmentType: query.assignmentType },
      });

      if (userAssignedCourses.length < 1) {
        return {
          data: [],
          certificateDict,
          count: 0,
        };
      }

      filterIds.push(...userAssignedCourses.map((uac) => uac.courseId));
    }

    const { total, data: searchResult } = await this.courseSearchService.search(
      filter.map((item) => item.id).join(' '),
      query.type,
      query.language,
      query.durationStart,
      query.durationEnd,
      query.categoryKey,
      query.subCategoryKey,
      skip,
      take,
      filterIds,
      query.hasCertificate,
    );

    const ids: string[] = [];
    searchResult.forEach((sr) => {
      certificateDict[sr.id] = sr.hasCertificate;
      ids.push(sr.id);
    });

    if (!ids.length) {
      return {
        data: [],
        certificateDict,
        count: 0,
      };
    }

    const data = await this.courseRepository
      .createQueryBuilder('course')
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
      .where('course.id IN (:...ids)', { ids })
      .orderBy('course.createdAt', 'DESC')
      .getMany();

    return {
      data,
      certificateDict,
      count: total,
    };
  }

  async create(courseDto: CreateCourseBody, user: User) {
    const courseSubCategories = await this.courseSubCategoryRepository.find({
      where: { id: In(courseDto.courseOutlines.map((co) => co.categoryId)) },
    });

    this.validateCategorySubCategories(
      courseDto.categoryId,
      courseSubCategories,
    );
    const courseData: Course = this.courseRepository.create({
      ...courseDto,
      title: this.languageRepository.create(courseDto.title),
      tagLine: courseDto.tagLine
        ? this.languageRepository.create(courseDto.tagLine)
        : undefined,
      description: courseDto.description
        ? this.languageRepository.create(courseDto.description)
        : undefined,
      learningObjective: courseDto.learningObjective
        ? this.languageRepository.create(courseDto.learningObjective)
        : undefined,
      courseTarget: courseDto.courseTarget
        ? this.languageRepository.create(courseDto.courseTarget)
        : undefined,
      category: { id: courseDto.categoryId },
      courseTag: this.courseTagRepository.create(
        courseDto.tagIds.map((t) => ({ tag: { id: t } })),
      ),
      courseMaterial: this.courseMaterialRepository.create(
        courseDto.materialIds.map((m) => ({ material: { id: m } })),
      ),
      courseTopic: this.courseTopicRepository.create(
        courseDto.topicIds.map((t) => ({ topic: { id: t } })),
      ),
      courseOutline: this.courseOutlineRepository.create(
        courseDto.courseOutlines.map((co) => ({
          ...co,
          title: co.title
            ? this.languageRepository.create(co.title)
            : undefined,
          description: co.description
            ? this.languageRepository.create(co.description)
            : undefined,
          courseSession: this.courseSessionRepository.create(
            co.courseSessions
              .filter((cs) => !!cs.seats)
              .map((cs) => ({
                ...cs,
                courseSessionInstructor:
                  this.courseSessionInstructorRepository.create(
                    cs.instructorsIds.map((i) => ({ instructor: { id: i } })),
                  ),
              })),
          ),
          courseOutlineMediaPlayList:
            this.courseOutlineMediaPlayListRepository.create(
              co.mediaPlaylist.map((id, index) => ({
                media: { id },
                sequence: index,
              })),
            ),
          category: { id: co.categoryId },
          learningWay: { id: co.learningWayId },
          organizationProvider: co.organizationId
            ? { id: co.organizationId }
            : null,
          learningContentFile: co.learningContentFileKey
            ? this.learningContentFileRepository.create({
                filename:
                  co.learningContentFileKey?.split('/')[
                    co.learningContentFileKey?.split('/').length - 1
                  ],
                key: co.learningContentFileKey as string,
                mime: 'application/xml',
                bytes: 0,
                hash: '',
                uploader: user,
              })
            : null,
        })),
      ),
    });
    const course = await this.courseRepository.save(courseData);
    if (course.status === CourseStatus.Published) {
      const courseWithDetails = await this.findById(course.id);
      this.courseSearchService.indexCourse(courseWithDetails);
    }
    return course;
  }

  async update(id: string, courseDto: UpdateCourseBody, user: User) {
    const course = await this.courseRepository.findOne(id, {
      relations: ['courseOutline'],
      where: { isActive: true },
    });

    if (!course) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Course does not exist, id = "${id}"`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const courseSubCategories = await this.courseSubCategoryRepository.find({
      where: { id: In(courseDto.courseOutlines.map((co) => co.categoryId)) },
    });

    this.validateCategorySubCategories(
      courseDto.categoryId,
      courseSubCategories,
    );

    await Promise.all([
      this.courseTagRepository.delete({ course }),
      this.courseMaterialRepository.delete({ course }),
      this.courseTopicRepository.delete({ course }),
      this.courseOutlineMediaPlayListRepository.delete({
        courseOutline: {
          id: In(courseDto.courseOutlines.map((co) => co.id as string)),
        },
      }),
    ]);

    const courseSessionIds = flatten(
      courseDto.courseOutlines.map((co) =>
        co.courseSessions.filter((cs) => !!cs.id).map((cs) => cs.id as string),
      ),
    );

    if (courseSessionIds.length > 0) {
      const courseSessionInstructors =
        await this.courseSessionInstructorRepository.find({
          where: { courseSession: { id: In(courseSessionIds) } },
        });

      await this.courseSessionInstructorRepository.remove(
        courseSessionInstructors,
      );
    }

    const updatedCourseDraft = this.courseRepository.create({
      ...courseDto,
      id,
      title: this.languageRepository.create(courseDto.title),
      tagLine: courseDto.tagLine
        ? this.languageRepository.create(courseDto.tagLine)
        : undefined,
      description: courseDto.description
        ? this.languageRepository.create(courseDto.description)
        : undefined,
      learningObjective: courseDto.learningObjective
        ? this.languageRepository.create(courseDto.learningObjective)
        : undefined,
      courseTarget: courseDto.courseTarget
        ? this.languageRepository.create(courseDto.courseTarget)
        : undefined,
      category: { id: courseDto.categoryId },
      courseTag: this.courseTagRepository.create(
        courseDto.tagIds.map((t) => ({ tag: { id: t } })),
      ),
      courseMaterial: this.courseMaterialRepository.create(
        courseDto.materialIds.map((m) => ({ material: { id: m } })),
      ),
      courseTopic: this.courseTopicRepository.create(
        courseDto.topicIds.map((t) => ({ topic: { id: t } })),
      ),
      courseOutline: this.courseOutlineRepository.create(
        courseDto.courseOutlines.map((co) => ({
          ...co,
          id: co.id,
          title: co.title
            ? this.languageRepository.create(co.title)
            : undefined,
          description: co.description
            ? this.languageRepository.create(co.description)
            : undefined,
          category: { id: co.categoryId },
          learningWay: { id: co.learningWayId },
          organizationProvider: co.organizationId
            ? { id: co.organizationId }
            : null,
          learningContentFile: co.learningContentFileKey
            ? this.learningContentFileRepository.create({
                filename:
                  co.learningContentFileKey?.split('/')[
                    co.learningContentFileKey?.split('/').length - 1
                  ],
                key: co.learningContentFileKey as string,
                mime: 'application/xml',
                bytes: 0,
                hash: '',
                uploader: user,
              })
            : undefined,
          courseSession: this.courseSessionRepository.create(
            co.courseSessions
              .filter((cs) => !!cs.seats)
              .map((cs) => ({
                ...cs,
                id: cs.id,
                courseSessionInstructor:
                  this.courseSessionInstructorRepository.create(
                    cs.instructorsIds.map((i) => ({ instructor: { id: i } })),
                  ),
              })),
          ),
          courseOutlineMediaPlayList:
            this.courseOutlineMediaPlayListRepository.create(
              co.mediaPlaylist.map((mediaId, index) => ({
                media: { id: mediaId },
                sequence: index,
              })),
            ),
        })),
      ),
    });
    const updateCourse = await this.courseRepository.save(updatedCourseDraft);
    return updateCourse;
  }

  async createCourseOutline(
    courseId: string,
    courseOutlineDto: CreateCourseOutlineBody,
  ) {
    const course = await this.courseRepository.findOne(courseId, {
      relations: ['courseOutline'],
      where: { isActive: true },
    });

    if (!course) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Course does not exist, id = "${courseId}"`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const courseSubCategory = await this.courseSubCategoryRepository.findOne({
      where: { id: courseOutlineDto.categoryId },
    });
    this.validateCategorySubCategory(course.category.id, courseSubCategory);

    const courseOutlineData = this.courseOutlineRepository.create({
      ...courseOutlineDto,
      course: { id: course.id },
      courseSession: this.courseSessionRepository.create(
        courseOutlineDto.courseSessions.map((cs) => ({
          ...cs,
          courseSessionInstructor:
            this.courseSessionInstructorRepository.create(
              cs.instructorsIds.map((i) => ({ instructor: { id: i } })),
            ),
        })),
      ),
      courseOutlineMediaPlayList:
        this.courseOutlineMediaPlayListRepository.create(
          courseOutlineDto.mediaPlaylist.map((id, index) => ({
            sequence: index,
            media: { id },
          })),
        ),
      category: { id: courseOutlineDto.categoryId },
      learningWay: { id: courseOutlineDto.learningWayId },
      organizationProvider: courseOutlineDto.organizationId
        ? { id: courseOutlineDto.organizationId }
        : null,
      learningContentFile: courseOutlineDto.learningContentFileId
        ? { id: courseOutlineDto.learningContentFileId }
        : null,
    });

    const courseOutline = await this.courseOutlineRepository.save(
      courseOutlineData,
    );
    return courseOutline;
  }

  async updateCourseOutline(
    courseId: string,
    courseOutlineId: string,
    courseOutlineDto: UpdateCourseOutlineBody,
  ) {
    const course = await this.courseRepository.findOne(courseId, {
      relations: ['courseOutline'],
      where: { isActive: true },
    });
    const courseOutline = course?.courseOutline?.find(
      (co) => co.id === courseOutlineId && co.isActive,
    );

    if (!course || !courseOutline) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Course or course outline does not exist, courseId = "${courseId}", courseOutlineId = "${courseOutlineId}"`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const courseSubCategory = await this.courseSubCategoryRepository.findOne({
      where: { id: courseOutlineDto.categoryId },
    });
    this.validateCategorySubCategory(course.category.id, courseSubCategory);

    const updatedCourseOutline = this.courseOutlineRepository.create({
      ...courseOutlineDto,
      id: courseOutlineId,
      category: { id: courseOutlineDto.categoryId },
      learningWay: { id: courseOutlineDto.learningWayId },
      organizationProvider: courseOutlineDto.organizationId
        ? { id: courseOutlineDto.organizationId }
        : null,
      learningContentFile: courseOutlineDto.learningContentFileId
        ? { id: courseOutlineDto.learningContentFileId }
        : null,
    });

    const updated = await this.courseOutlineRepository.save(
      updatedCourseOutline,
    );
    return updated;
  }

  async createCourseSession(
    courseId: string,
    courseOutlineId: string,
    courseSessionDto: CreateCourseSessionBody,
  ) {
    const course = await this.courseRepository.findOne(courseId, {
      relations: ['courseOutline'],
      where: { isActive: true },
    });
    const courseOutline = course?.courseOutline?.find(
      (co) => co.id === courseOutlineId && co.isActive,
    );

    if (!course || !courseOutline) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Course or course outline does not exist, courseId = "${courseId}", courseOutlineId = "${courseOutlineId}"`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const courseSessionData = this.courseSessionRepository.create({
      ...courseSessionDto,
      courseOutline: { id: courseOutlineId },
      courseSessionInstructor: this.courseSessionInstructorRepository.create(
        courseSessionDto.instructorsIds.map((i) => ({ instructor: { id: i } })),
      ),
    });

    const courseSession = await this.courseSessionRepository.save(
      courseSessionData,
    );
    return courseSession;
  }

  async updateCourseSession(
    courseSessionId: string,
    courseSessionDto: CreateCourseSessionBody,
  ) {
    const courseSession = await this.courseSessionRepository.findOne(
      courseSessionId,
      { where: { isActive: true } },
    );

    if (!courseSession) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Course session does not exist, courseSessionId = "${courseSessionId}"`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.courseSessionInstructorRepository.delete({ courseSession });

    const courseSessionData = this.courseSessionRepository.create({
      ...courseSessionDto,
      id: courseSessionId,
      courseSessionInstructor: this.courseSessionInstructorRepository.create(
        courseSessionDto.instructorsIds.map((i) => ({ instructor: { id: i } })),
      ),
    });

    const updated = await this.courseSessionRepository.save(courseSessionData);
    return updated;
  }

  async findAll(query: CourseQueryDto) {
    let courseQuery = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.title', 'title')
      .leftJoinAndSelect('course.tagLine', 'tagLine')
      .leftJoinAndSelect('course.description', 'description')
      .leftJoinAndSelect('course.learningObjective', 'learningObjective')
      .leftJoinAndSelect('course.courseTarget', 'courseTarget')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.courseTag', 'courseTag')
      .leftJoinAndSelect('course.courseTopic', 'courseTopic')
      .leftJoinAndSelect('course.courseOutline', 'courseOutline')
      .leftJoinAndSelect('courseOutline.category', 'subCategory')
      .leftJoinAndSelect('courseOutline.learningWay', 'learningWay')
      .leftJoinAndSelect('courseTag.tag', 'tag', 'tag.isActive = :isActive', {
        isActive: true,
      })
      .leftJoinAndSelect(
        'courseTopic.topic',
        'topic',
        'topic.isActive = :isActive',
        { isActive: true },
      )
      .where('course.isActive = true');

    if (
      query.searchField === 'topic' ||
      query.searchField === 'tag' ||
      query.searchField === 'category'
    ) {
      courseQuery = courseQuery.andWhere(
        `${query.searchField}.name ILIKE :name`,
        {
          name: `%${query.search}%`,
        },
      );
    } else if (query.searchField === 'learningWay') {
      courseQuery = courseQuery.andWhere('learningWay.name ILIKE :name', {
        name: `%${query.search}%`,
      });
    } else if (query.searchField === 'title') {
      courseQuery.andWhere(
        '(title.nameEn ILIKE :name OR title.nameTh ILIKE :name)',
        {
          name: `%${query.search}%`,
        },
      );
    } else if (query.searchField !== '') {
      courseQuery = courseQuery.andWhere(
        `course.${query.searchField} ILIKE :name`,
        {
          name: `%${query.search}%`,
        },
      );
    }

    const queryOrder = typeof query.order === 'string' ? query.order : 'DESC';
    if (query.orderBy === 'title') {
      courseQuery = courseQuery.orderBy('title.nameEn', queryOrder);
      courseQuery = courseQuery.addOrderBy('title.nameTh', queryOrder);
    } else {
      courseQuery = courseQuery.orderBy(`course.${query.orderBy}`, queryOrder);
    }

    const count = await courseQuery.getCount();

    const data = await courseQuery.skip(query.skip).take(query.take).getMany();

    if (query.id && !data.some((course) => course.id === query.id)) {
      const specificCourse = await courseQuery
        .andWhere('course.id = :id', { id: query.id })
        .getOne();
      if (specificCourse) {
        data.unshift(specificCourse);
      }
    }

    return { data, count };
  }

  async findCategories() {
    return this.courseCategoryRepository.find();
  }

  async findSubCategories() {
    return this.courseSubCategoryRepository.find();
  }

  async checkCourseOutlineBookingEligibility(
    outlineId: CourseOutline['id'],
    userId: User['id'],
  ): Promise<{
    type: CourseRuleType;
    courseOutlineId: CourseOutline['id'];
  } | null> {
    const prerequisiteRules = await this.courseRuleItemRepository.find({
      where: {
        appliedFor: {
          id: outlineId,
        },
        type: CourseRuleType.REQUIRED,
        isActive: true,
      },
      relations: ['appliedBy'],
    });
    const prebookingRules = await this.courseRuleItemRepository
      .createQueryBuilder('ruleItems')
      .leftJoinAndSelect('ruleItems.appliedFor', 'appliedFor')
      .leftJoinAndSelect('ruleItems.appliedBy', 'appliedBy')
      .leftJoinAndSelect('appliedBy.courseSession', 'appliedByCourseSession')
      .leftJoinAndSelect(
        'appliedByCourseSession.courseSessionBooking',
        'appliedByCourseSessionBooking',
        'appliedByCourseSessionBooking.student = :userId',
      )
      .where('appliedFor.id = :outlineId')
      .andWhere(
        'ruleItems.type = :ruleItemType AND ruleItems.isActive = :isActive',
      )
      .setParameters({
        ruleItemType: CourseRuleType.BOOK,
        outlineId,
        userId,
        isActive: true,
      })
      .getMany();

    if (prerequisiteRules.length <= 0 && prebookingRules.length <= 0)
      return null;

    const preRequisiteCourseOutlines = prerequisiteRules
      .map((rule) => rule.appliedBy)
      .filter((abco) => outlineId !== abco.id);

    const preBookingCourseOutlines = prebookingRules
      .map((rule) => rule.appliedBy)
      .filter((abco) => outlineId !== abco.id);

    if (
      preRequisiteCourseOutlines.length <= 0 &&
      preBookingCourseOutlines.length <= 0
    )
      return null;

    const userCourseOutlineProgresses =
      await this.userCourseOutlineProgressRepository.find({
        where: {
          courseOutline: {
            id: In(preRequisiteCourseOutlines.map((co) => co.id)),
          },
          user: { id: userId },
        },
      });

    const completedUserCourseOutlineProgresses =
      userCourseOutlineProgresses.filter(
        (ucop) => ucop.status === UserCourseOutlineProgressStatus.COMPLETED,
      );

    if (
      completedUserCourseOutlineProgresses.length !==
      preRequisiteCourseOutlines.length
    ) {
      const courseOutline = userCourseOutlineProgresses.find(
        (co) => co.status !== UserCourseOutlineProgressStatus.COMPLETED,
      );
      if (courseOutline) {
        return {
          type: CourseRuleType.REQUIRED,
          courseOutlineId: courseOutline.id,
        };
      }
    }

    const requiredBookingRuleItem = prebookingRules.find((ruleItem) => {
      const hasBooking = ruleItem.appliedBy.courseSession.some((session) =>
        session.courseSessionBooking.some(
          (booking) => booking.studentId === userId,
        ),
      );

      return !hasBooking;
    });

    if (requiredBookingRuleItem) {
      return {
        type: CourseRuleType.BOOK,
        courseOutlineId: requiredBookingRuleItem.appliedBy.id,
      };
    }
    return null;
  }

  async findAllCourseOutlines(
    courseId: string,
    user: User,
    startOfToday: string,
    endOfRange: string,
  ) {
    const query = this.courseOutlineRepository
      .createQueryBuilder('co')
      .leftJoinAndSelect('co.title', 'title')
      .leftJoinAndSelect('co.category', 'category')
      .leftJoinAndSelect('co.description', 'description')
      .leftJoinAndSelect(
        'co.courseSession',
        'cs',
        'cs.isActive = :isActive AND cs.startDateTime >= :startOfToday AND cs.startDateTime <= :threeMonthsFromNow AND cs.cancelled = :cancelled',
        {
          isActive: true,
          startOfToday,
          threeMonthsFromNow: endOfRange,
          cancelled: false,
        },
      )
      .leftJoinAndSelect(
        'cs.courseSessionBooking',
        'csb',
        'csb.studentId = :studentId',
        {
          studentId: user.id,
        },
      )
      .loadRelationCountAndMap('ccs.seatsBooked', 'cs.courseSessionBooking')
      .where('co.courseId = :courseId AND co.isActive = :isActive', {
        courseId,
        isActive: true,
      });

    const courseOutlines = await query.getMany();

    const areEligible = (
      await Promise.all(
        courseOutlines.map((outline) =>
          this.checkCourseOutlineBookingEligibility(outline.id, user.id),
        ),
      )
    ).map((co) => co === null);

    return { courseOutlines, areEligible };
  }

  async findAllCourseSessions(courseOutlineId: string) {
    const courseOutlines = await this.courseSessionRepository.find({
      where: { courseOutline: { id: courseOutlineId }, isActive: true },
      relations: ['courseSessionInstructor'],
    });

    return courseOutlines;
  }

  async findById(id: string) {
    const course = await this.courseRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.title', 'title')
      .leftJoinAndSelect('c.tagLine', 'tagLine')
      .leftJoinAndSelect('c.description', 'description')
      .leftJoinAndSelect('c.learningObjective', 'learningObjective')
      .leftJoinAndSelect('c.courseTarget', 'courseTarget')
      .leftJoinAndSelect('c.category', 'category')
      .leftJoinAndSelect(
        'c.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect('courseOutline.title', 'courseOutlineTitle')
      .leftJoinAndSelect(
        'courseOutline.description',
        'courseOutlineDescription',
      )
      .leftJoinAndSelect('courseOutline.category', 'subCategory')
      .leftJoinAndSelect(
        'courseOutline.learningWay',
        'learningWay',
        'learningWay.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'courseOutline.learningContentFile',
        'learningContentFile',
      )
      .leftJoinAndSelect(
        'courseOutline.organizationProvider',
        'organizationProvider',
        'organizationProvider.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'courseOutline.courseSession',
        'courseSession',
        'courseSession.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'courseOutline.courseOutlineMediaPlayList',
        'courseOutlineMediaPlayList',
      )
      .leftJoinAndSelect('courseOutlineMediaPlayList.media', 'media')
      .leftJoinAndSelect(
        'courseSession.courseSessionInstructor',
        'courseSessionInstructor',
      )
      .leftJoinAndSelect('courseSessionInstructor.instructor', 'instructor')
      .leftJoinAndSelect('c.courseTag', 'courseTag')
      .leftJoinAndSelect('c.courseTopic', 'courseTopic')
      .leftJoinAndSelect('c.courseMaterial', 'courseMaterial')
      .leftJoinAndSelect('courseTag.tag', 'tag', 'tag.isActive = :isActive', {
        isActive: true,
      })
      .leftJoinAndSelect(
        'courseTopic.topic',
        'topic',
        'topic.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'courseMaterial.material',
        'material',
        'material.isActive = :isActive',
        { isActive: true },
      )
      .where('c.isActive = :isActive', {
        isActive: true,
      })
      .andWhere('c.id = :courseId', {
        courseId: id,
      })
      .addOrderBy('courseOutline.part', 'ASC')
      .addOrderBy('courseOutlineMediaPlayList.sequence', 'ASC')
      .getOne();

    if (!course) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Course not found.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return course;
  }

  async findDetail(
    id: string,
    user: User,
    startOfToday: string,
    endOfRange: string,
  ) {
    const course = await this.courseRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.title', 'title')
      .leftJoinAndSelect('c.tagLine', 'tagLine')
      .leftJoinAndSelect('c.description', 'description')
      .leftJoinAndSelect('c.learningObjective', 'learningObjective')
      .leftJoinAndSelect('c.courseTarget', 'courseTarget')
      .leftJoinAndSelect(
        'c.userAssignedCourse',
        'userAssignedCourse',
        'userAssignedCourse.userId = :userId',
        { userId: user.id },
      )
      .leftJoinAndSelect('c.category', 'category')
      .leftJoinAndSelect(
        'c.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect('courseOutline.title', 'courseOutlineTitle')
      .leftJoinAndSelect('courseOutline.description', 'courseOutlineDesc')
      .leftJoinAndSelect(
        'c.userEnrolledCourse',
        'userEnrolledCourse',
        'userEnrolledCourse.isActive = :isActive AND userEnrolledCourse.userId = :userId',
        { isActive: true, userId: user.id },
      )
      .leftJoinAndSelect('courseOutline.category', 'subCategory')
      .leftJoinAndSelect(
        'courseOutline.learningWay',
        'learningWay',
        'learningWay.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'courseOutline.learningContentFile',
        'learningContentFile',
      )
      .leftJoinAndSelect(
        'courseOutline.organizationProvider',
        'organizationProvider',
        'organizationProvider.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'courseOutline.userCourseOutlineProgress',
        'userCourseOutlineProgress',
        'userCourseOutlineProgress.isActive = :isActive AND userCourseOutlineProgress.userId = :userId',
        { isActive: true, userId: user.id },
      )
      .leftJoinAndSelect(
        'courseOutline.courseSession',
        'courseSession',
        'courseSession.isActive = :isActive AND courseSession.startDateTime >= :startOfToday AND courseSession.startDateTime <= :threeMonthsFromNow AND courseSession.cancelled = :cancelled',
        {
          isActive: true,
          startOfToday,
          threeMonthsFromNow: endOfRange,
          cancelled: false,
        },
      )

      .leftJoinAndSelect(
        'courseOutline.courseOutlineMediaPlayList',
        'courseOutlineMediaPlayList',
      )
      .leftJoinAndSelect('courseOutlineMediaPlayList.media', 'media')
      .leftJoinAndSelect(
        'courseSession.courseSessionInstructor',
        'courseSessionInstructor',
      )
      .leftJoinAndSelect('courseSessionInstructor.instructor', 'instructor')
      .loadRelationCountAndMap(
        'courseSession.seatsBooked',
        'courseSession.courseSessionBooking',
      )
      .leftJoinAndSelect(
        'courseSession.courseSessionBooking',
        'courseSessionBooking',
        'courseSessionBooking.studentId = :studentId',
        { studentId: user.id },
      )
      .leftJoinAndSelect('c.courseTopic', 'courseTopic')
      .leftJoinAndSelect('c.courseMaterial', 'courseMaterial')
      .leftJoinAndSelect(
        'courseTopic.topic',
        'topic',
        'topic.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'courseMaterial.material',
        'material',
        'material.isActive = :isActive',
        { isActive: true },
      )
      .where('c.id = :courseId', {
        courseId: id,
      })
      .andWhere('c.isActive = :isActive', {
        isActive: true,
      })
      .andWhere('c.status = :status', {
        status: CourseStatus.Published,
      })
      .addOrderBy('courseOutline.part', 'ASC')
      .addOrderBy('courseOutlineMediaPlayList.sequence', 'ASC')
      .getOne();

    if (!course) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Course not found.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return course;
  }

  async findCourseOutlineById(courseOutlineId: string, user: User) {
    const courseOutline = await this.courseOutlineRepository.findOne(
      courseOutlineId,
      {
        where: { isActive: true },
      },
    );

    if (!courseOutline) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Course Outline not found.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const isBookingEligible =
      (await this.checkCourseOutlineBookingEligibility(
        courseOutlineId,
        user.id,
      )) === null;

    return { courseOutline, isBookingEligible };
  }

  async findCourseSessionById(courseSessionId: string) {
    const courseSession = await this.courseSessionRepository.findOne(
      courseSessionId,
      {
        relations: ['courseSessionInstructor'],
        where: { isActive: true },
      },
    );

    if (!courseSession) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Course session not found.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return courseSession;
  }

  async findLearningContentById(contentId: string) {
    return this.learningContentFileRepository.findOne(contentId);
  }

  async deleteLanguageFromCourses(ids: string[]) {
    const courses = await this.courseRepository.find({
      where: { id: In(ids) },
      relations: ['courseOutline'],
    });
    const coursePromises = courses.map(async (c) => {
      const promises = [];
      if (c.title) promises.push(this.languageRepository.remove(c.title));
      if (c.tagLine) promises.push(this.languageRepository.remove(c.tagLine));
      if (c.description)
        promises.push(this.languageRepository.remove(c.description));
      if (c.learningObjective)
        promises.push(this.languageRepository.remove(c.learningObjective));
      if (c.courseTarget)
        promises.push(this.languageRepository.remove(c.courseTarget));
      c.courseOutline?.forEach(async (co) => {
        if (co.title) promises.push(this.languageRepository.remove(co.title));
        if (co.description)
          promises.push(this.languageRepository.remove(co.description));
      });
      await Promise.all(promises);
      return this.courseRepository.save(c);
    });

    await Promise.all(coursePromises);
  }

  async deleteLanguageByLanguageIds(languageIds: string[]) {
    await this.languageRepository
      .createQueryBuilder('language')
      .delete()
      .where('id IN(:...languageIds)', { languageIds })
      .execute();
  }

  async delete(id: string) {
    await this.deleteLanguageFromCourses([id]);
    await this.courseRepository.delete({ id });
    this.courseSearchService.removeIndex(id);
  }

  async deleteMany(ids: string[]) {
    await this.deleteLanguageFromCourses(ids);
    await this.courseRepository.delete({ id: In(ids) });
    await this.courseSearchService.removeIndex(ids.join(' '));
  }

  async deleteManyCourseOutlines(ids: string[]) {
    await this.courseOutlineRepository.delete({ id: In(ids) });
  }

  async deleteManyCourseSessions(ids: string[]) {
    await this.courseSessionRepository.delete({ id: In(ids) });
  }

  async getCourseSessionUploadHistoryByS3Key(
    key: string,
  ): Promise<CourseSessionUploadHistory> {
    const history = await this.courseSessionUploadHistoryRepository.findOne({
      where: {
        s3key: key,
      },
    });

    if (!history) {
      throw new HttpException(
        'Course session upload history does not exists',
        HttpStatus.NOT_FOUND,
      );
    }

    return history;
  }

  async enroll(
    courseId: string,
    user: User,
    startOfToday: string,
    endOfRange: string,
  ) {
    const enrollStatus: {
      success: boolean;
      preRequisiteCourse: Course | null;
    } = {
      success: true,
      preRequisiteCourse: null,
    };

    const [userEnrolledCourse, course] = await Promise.all([
      this.userEnrolledCourseRepository.findOne({
        where: { course: { id: courseId }, user: { id: user.id } },
      }),
      this.courseRepository.findOne(courseId, {
        relations: ['courseOutline'],
      }),
    ]);

    if (!course) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Course does not exist, id = "${courseId}"`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (userEnrolledCourse) {
      return { enrollStatus, course };
    }

    await this.courseAccessCheckerService.validateSubscribedCourseAccess(
      user,
      course,
    );

    const preRequisiteCourse = await this.getPreRequisiteCourse(
      course,
      user,
      startOfToday,
      endOfRange,
    );
    if (!preRequisiteCourse) {
      await this.userEnrolledCourseRepository.save({
        course,
        user,
        status: UserEnrolledCourseStatus.ENROLLED,
        percentage: 0,
      });
      const courseOutlineIds = course.courseOutline.map((co) => co.id);
      const preAssessmentRuleItems = await this.courseRuleItemRepository.find({
        where: {
          appliedFor: { id: In(courseOutlineIds) },
          type: CourseRuleType.PRE_ASSESSMENT,
          isActive: true,
        },
        relations: ['appliedBy'],
      });
      if (preAssessmentRuleItems.length > 0) {
        const preAssessmentCourseOutlines = preAssessmentRuleItems.map(
          (cri) => cri.appliedBy,
        );

        const preAssessmentCourseIds = uniq(
          preAssessmentCourseOutlines.map((outline) => outline.courseId),
        );

        await Promise.all(
          preAssessmentCourseIds.map((preAssessmentCourseId) =>
            this.enroll(preAssessmentCourseId, user, startOfToday, endOfRange),
          ),
        );

        preAssessmentCourseOutlines.forEach((outline) =>
          this.notificationProducer
            .notify(
              PushNotificationSubCategoryKey.REMINDER_ASSESSMENT_UNLOCKED,
              user.id,
              {
                [NV.ASSESSMENT_NAME.alias]: outline.assessmentName,
              },
            )
            .catch(),
        );
      }
    } else {
      enrollStatus.success = false;
      enrollStatus.preRequisiteCourse = preRequisiteCourse;
    }

    return { enrollStatus, course };
  }

  async getPreRequisiteCourse(
    course: Course,
    user: User,
    startOfToday: string,
    endOfRange: string,
  ): Promise<Course | null> {
    // 1. Check if pre-requisite rule exists.
    const courseOutlineIds = course.courseOutline.map((co) => co.id);
    const courseRuleItems = await this.courseRuleItemRepository.find({
      where: {
        appliedFor: { id: In(courseOutlineIds) },
        type: CourseRuleType.REQUIRED,
        isActive: true,
      },
      relations: ['appliedBy'],
    });

    if (courseRuleItems.length < 1) {
      return null;
    }

    // 2. Check if pre-requisites are from different course
    const appliedByCourseOutlines = courseRuleItems.map((cri) => cri.appliedBy);
    const preRequisiteCourseOutlines = appliedByCourseOutlines.filter(
      (abco) => !courseOutlineIds.includes(abco.id),
    );

    if (preRequisiteCourseOutlines.length < 1) {
      return null;
    }

    // Check if pre-requisites from different courses are completed by user
    const userCourseOutlineProgresses =
      await this.userCourseOutlineProgressRepository.find({
        where: {
          courseOutline: {
            id: In(preRequisiteCourseOutlines.map((prco) => prco.id)),
          },
          user: { id: user.id },
        },
        relations: ['courseOutline'],
      });

    const completedUserCourseOutlineProgresses =
      userCourseOutlineProgresses.filter(
        (ucop) => ucop.status === UserCourseOutlineProgressStatus.COMPLETED,
      );

    if (
      completedUserCourseOutlineProgresses.length ===
      preRequisiteCourseOutlines.length
    ) {
      return null;
    }

    // Return one of the incomplete pre requisite course
    const completedUserCourseOutlineId =
      completedUserCourseOutlineProgresses.map(
        (cucop) => cucop.courseOutline.id,
      );
    const incompleteCourseOutlines = preRequisiteCourseOutlines.filter(
      (prco) => !completedUserCourseOutlineId.includes(prco.id),
    );

    const preRequisiteCourse = await this.findDetail(
      incompleteCourseOutlines[0].courseId,
      user,
      startOfToday,
      endOfRange,
    );

    return preRequisiteCourse;
  }

  async findAllCourseMedia(courseId: string, limit = 0) {
    const query = this.courseOutlineMediaPlayListRepository
      .createQueryBuilder('outlineMediaPlaylist')
      .innerJoinAndSelect(
        'outlineMediaPlaylist.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'courseOutline.course',
        'course',
        'course.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'outlineMediaPlaylist.media',
        'media',
        'media.isActive = :isActive',
      )
      .where(
        'outlineMediaPlaylist.isActive = :isActive AND course.id = :courseId AND media.status = :mediaStatus',
      )
      .setParameters({
        courseId,
        isActive: true,
        mediaStatus: MediaStatus.Available,
      })
      .orderBy('courseOutline.part', 'ASC')
      .addOrderBy('outlineMediaPlaylist.sequence', 'ASC');

    if (limit > 0) {
      query.limit(limit);
    }

    const outlineMediaPlaylist = await query.getMany();

    const videos = outlineMediaPlaylist.map((it) => ({
      ...it.media,
      playlistId: it.id,
      courseOutlineId: it.courseOutline.id,
    }));
    return videos;
  }

  async getFirstVideo(courseId: string) {
    const outlineMediaPlaylist = await this.courseOutlineMediaPlayListRepository
      .createQueryBuilder('outlineMediaPlaylist')
      .innerJoinAndSelect(
        'outlineMediaPlaylist.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'courseOutline.course',
        'course',
        'course.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'outlineMediaPlaylist.media',
        'media',
        'media.isActive = :isActive',
      )
      .where(
        'outlineMediaPlaylist.isActive = :isActive AND course.id = :courseId AND media.status = :mediaStatus',
      )
      .setParameters({
        courseId,
        isActive: true,
        mediaStatus: MediaStatus.Available,
      })
      .orderBy('courseOutline.part', 'ASC')
      .addOrderBy('outlineMediaPlaylist.sequence', 'ASC')
      .limit(1)
      .getOne();

    if (outlineMediaPlaylist && outlineMediaPlaylist.media) {
      return outlineMediaPlaylist?.media;
    }
    throw new HttpException(
      'There is no video in playlist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getLastSeenVideo(courseId: string, user: User) {
    const videoMetadata = await this.userVideoCourseOutlineMetadataRepository
      .createQueryBuilder('videoMetadata')
      .innerJoinAndSelect(
        'videoMetadata.userCourseOutlineProgress',
        'userCourseOutlineProgress',
        'userCourseOutlineProgress.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'videoMetadata.lastVideo',
        'lastVideo',
        'lastVideo.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'userCourseOutlineProgress.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'courseOutline.course',
        'course',
        'course.isActive = :isActive',
      )
      .where('videoMetadata.isActive = :isActive')
      .andWhere('userCourseOutlineProgress.userId = :userId')
      .andWhere('course.id = :courseId')
      .setParameters({
        courseId,
        userId: user.id,
        isActive: true,
      })
      .select(['videoMetadata', 'lastVideo'])
      .getOne();

    return videoMetadata?.lastVideo;
  }

  async getCourseVideoProgress(courseId: string, user: User) {
    const videoMetadata = await this.userVideoCourseOutlineMetadataRepository
      .createQueryBuilder('videoMetadata')
      .innerJoinAndSelect(
        'videoMetadata.userCourseOutlineProgress',
        'userCourseOutlineProgress',
        'userCourseOutlineProgress.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'userCourseOutlineProgress.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'courseOutline.course',
        'course',
        'course.isActive = :isActive',
      )
      .where('videoMetadata.isActive = :isActive')
      .andWhere('course.id = :courseId')
      .andWhere('userCourseOutlineProgress.userId = :userId')
      .setParameters({
        courseId,
        userId: user.id,
        isActive: true,
      })
      .getMany();

    const videoProgress = flatten(videoMetadata.map((it) => it.videoProgress));

    return videoProgress;
  }

  private validateCategorySubCategory(
    categoryId: string,
    courseSubCategory: CourseSubCategory | undefined,
  ) {
    if (
      !courseSubCategory ||
      courseSubCategory.courseCategory.id !== categoryId
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Course category and sub-category mismatch',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private validateCategorySubCategories(
    categoryId: string,
    subCategories: CourseSubCategory[],
  ) {
    const subCategoriesMappedCategoryIds = subCategories.map(
      (sc) => sc.courseCategory.id,
    );

    if (
      !subCategories.length ||
      subCategoriesMappedCategoryIds[0] !== categoryId ||
      !subCategoriesMappedCategoryIds.every(
        (c) => c === subCategoriesMappedCategoryIds[0],
      )
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Course category and sub-category mismatch',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getCertificateMap(originalIds: string[]) {
    const chunkSize = 1000;
    const chunkIds = chunk(originalIds, chunkSize);

    const resultMap = new Map<string, boolean>();

    const promises = chunkIds.map((courseIds) => {
      return this.certificateUnlockRuleCourseItemRepository
        .createQueryBuilder('item')
        .where('item.courseId IN(:...courseIds)')
        .select('item.courseId', 'course_id')
        .addSelect('COUNT(item.courseId) > 0', 'has_certificate')
        .groupBy('item.courseId')
        .setParameters({ courseIds })
        .getRawMany<{ course_id: string; has_certificate: boolean }>();
    });

    const rawResult = await Promise.all(promises);
    const flattenResult = flatten(rawResult);
    flattenResult.forEach((result) => {
      resultMap.set(result.course_id, result.has_certificate);
    });

    return resultMap;
  }

  async findLinkedCertificates(courseIds: string[]) {
    if (!courseIds.length) return {};

    const dict: { [key: string]: boolean } = {};
    const items = await this.certificateUnlockRuleCourseItemRepository
      .createQueryBuilder('curi')
      .select('curi.courseId')
      .where('curi.isActive = :isActive')
      .andWhere('curi.courseId IN(:...courseIds)')
      .setParameters({
        isActive: true,
        courseIds,
      })
      .getMany();

    courseIds.forEach((id) => {
      dict[id] = items.some((it) => it.courseId === id);
    });
    return dict;
  }
}
