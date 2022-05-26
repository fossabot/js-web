import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadProcessStatus } from '@seaccentral/core/dist/bulk-upload/UploadProcessStatus.enum';
import { Course } from '@seaccentral/core/dist/course/Course.entity';
import { UserAssignedCourse } from '@seaccentral/core/dist/course/UserAssignedCourse.entity';
import { UserAssignedCourseUploadHistory } from '@seaccentral/core/dist/course/UserAssignedCourseUploadHistory.entity';
import { UserEnrolledCourse } from '@seaccentral/core/dist/course/UserEnrolledCourse.entity';
import { UserEnrolledCourseStatus } from '@seaccentral/core/dist/course/UserEnrolledCourseStatus.enum';
import { OrderType } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import {
  getPaginationRequestParams,
  getSearchRequestParams,
  getSortRequestParams,
  IListParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { GroupUser } from '@seaccentral/core/dist/group/GroupUser.entity';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { EmailNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/EmailNotificationSubCategory.enum';
import { NotificationVariableDict as NV } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { getStringFromLanguage } from '@seaccentral/core/dist/utils/language';
import { generateHtmlList } from '@seaccentral/core/dist/utils/email';
import { format } from 'date-fns';
import { flatten } from 'lodash';
import { Brackets, ILike, In, Repository } from 'typeorm';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';
import { RedisCacheService } from '@seaccentral/core/dist/redis/redisCache.service';
import { cacheKeys } from '@seaccentral/core/dist/redis/cacheKeys';

import { GroupService } from '../group/group.service';
import { CreateUserAssignedCourseBody } from './dto/CreateUserAssignedCourseBody.dto';
import { UpdateUserAssignedCourseBody } from './dto/UpdateUserAssignedCourseBody.dto';
import {
  UserAssignedCourseBulkUploadBody,
  UserAssignedCourseUploadFile,
} from './dto/UserAssignedCourseBulkUploadBody.dto';
import { UserAssignedCourseQueryDto } from './dto/UserAssignedCourseQuery.dto';

@Injectable()
export class UserAssignedCourseService {
  private logger = new Logger(UserAssignedCourseService.name);

  constructor(
    private readonly groupService: GroupService,
    private readonly notificationProducer: NotificationProducer,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(GroupUser)
    private groupUserRepository: Repository<GroupUser>,
    @InjectRepository(OrganizationUser)
    private organizationUser: Repository<OrganizationUser>,
    @InjectRepository(UserAssignedCourse)
    private userAssignedCourseRepository: Repository<UserAssignedCourse>,
    @InjectRepository(UserEnrolledCourse)
    private userEnrolledCourseRepository: Repository<UserEnrolledCourse>,
    @InjectRepository(UserAssignedCourseUploadHistory)
    private userAssignedCourseUploadHistoryRepository: Repository<UserAssignedCourseUploadHistory>,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async listAssignedCourses(
    query: UserAssignedCourseQueryDto,
    languageCode: LanguageCode,
  ) {
    const { search } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);
    const { skip, take } = getPaginationRequestParams(query);

    const builder = this.userAssignedCourseRepository
      .createQueryBuilder('uac')
      .innerJoinAndSelect('uac.user', 'user')
      .leftJoinAndSelect('user.groupUser', 'groupUser')
      .leftJoinAndSelect('groupUser.group', 'group')
      .leftJoinAndSelect('user.organizationUser', 'organizationUser')
      .leftJoinAndSelect('organizationUser.organization', 'organization')
      .innerJoinAndSelect('uac.course', 'course')
      .innerJoinAndSelect('course.title', 'title')
      .where({
        isActive: true,
      });

    if (search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('title.nameEn ILIKE :search OR title.nameTh ILIKE :search', {
            search: `%${search}%`,
          }).orWhere('user.email ILIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    if (orderBy === 'courseTitle') {
      builder.orderBy(
        `title.${languageCode === LanguageCode.EN ? 'nameEn' : 'nameTh'}`,
        order as OrderType,
      );
    } else if (orderBy === 'email') {
      builder.orderBy('user.email', order as OrderType);
    } else if (orderBy === 'groupName') {
      builder.orderBy('group.name', order as OrderType);
    } else if (orderBy === 'organizationName') {
      builder.orderBy('organization.name', order as OrderType);
    } else if (orderBy) {
      builder.orderBy(`uac.${orderBy}`, order as OrderType);
    }

    const count = await builder.getCount();
    const data = await builder.skip(skip).take(take).getMany();

    return { data, count };
  }

  async create(dto: CreateUserAssignedCourseBody) {
    const course = await this.courseRepository.findOne(dto.courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const userIdsSet = new Set<string>(dto.userIds);

    if (dto.groupIds && dto.groupIds.length > 0) {
      const groupUsers = await this.groupUserRepository.find({
        where: {
          group: { id: In(dto.groupIds) },
        },
        relations: ['user'],
      });

      const descendantGroupUsers = await Promise.all(
        dto.groupIds.map((gi) =>
          this.groupService.getDescendantUsers(gi).catch(() => null),
        ),
      );
      const flattenDescendantGroupUsers = flatten(
        descendantGroupUsers.filter((dgu) => dgu !== null),
      );

      groupUsers.forEach((gu) => userIdsSet.add(gu.user.id));
      flattenDescendantGroupUsers.forEach(
        (dgu) => dgu && userIdsSet.add(dgu.user.id),
      );
    }

    if (dto.organizationIds && dto.organizationIds.length > 0) {
      const organizationUsers = await this.organizationUser.find({
        where: {
          organization: { id: In(dto.organizationIds) },
        },
        relations: ['user'],
      });

      organizationUsers.forEach((ou) => userIdsSet.add(ou.user.id));
    }

    const userAssignedCourseData = this.userAssignedCourseRepository.create(
      [...userIdsSet].map((ui) => ({
        userId: ui,
        dueDateTime: dto.dueDateTime ?? null,
        courseId: dto.courseId,
        assignmentType: dto.assignmentType,
      })),
    );

    await Promise.all([
      this.userAssignedCourseRepository.upsert(userAssignedCourseData, [
        'userId',
        'courseId',
      ]),
      this.enrollUsersToCourse([...userIdsSet], dto.courseId),
    ]);

    [...userIdsSet].forEach((userId) => {
      this.notificationProducer
        .notify(PushNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE, userId, {
          [NV.COURSE_NAME.alias]: course.title,
        })
        .catch();
      this.sendEmail(userId, [dto.courseId]).catch();
    });

    await this.redisCacheService
      .del(cacheKeys.USER_DASHBOARD.COURSE_DISCOVERY)
      .catch((err) =>
        this.logger.error('Error deleting cache for COURSE_DISCOVERY', err),
      );
  }

  async update(id: string, dto: UpdateUserAssignedCourseBody) {
    const userAssignedCourse = await this.userAssignedCourseRepository.findOne(
      id,
    );

    if (!userAssignedCourse) {
      throw new NotFoundException('User Assigned Course not found');
    }

    if (userAssignedCourse.courseId !== dto.courseId) {
      const existing = await this.userAssignedCourseRepository.findOne({
        where: { userId: userAssignedCourse.userId, courseId: dto.courseId },
      });

      if (existing) {
        throw new ConflictException(
          'User Assigned Course has existing mapping for this user and course.',
        );
      }
    } 

    userAssignedCourse.courseId = dto.courseId;
    userAssignedCourse.assignmentType = dto.assignmentType;

    userAssignedCourse.dueDateTime = dto.dueDateTime
      ? new Date(dto.dueDateTime)
      : null;

    await this.userAssignedCourseRepository.save(userAssignedCourse);

    await this.redisCacheService
      .del(cacheKeys.USER_DASHBOARD.COURSE_DISCOVERY)
      .catch((err) =>
        this.logger.error('Error deleting cache for COURSE_DISCOVERY', err),
      );
  }

  async deleteMany(ids: string[]) {
    await this.userAssignedCourseRepository.delete({ id: In(ids) });
  }

  async recordBulkUploadHistory(
    uploadFileDto: UserAssignedCourseUploadFile,
    user: User,
  ) {
    const history = this.userAssignedCourseUploadHistoryRepository.create({
      file: uploadFileDto.fileName,
      uploadedBy: user,
      status: UploadProcessStatus.PENDING,
      s3key: uploadFileDto.key,
    });

    await this.userAssignedCourseUploadHistoryRepository.save(history);

    await this.redisCacheService
      .del(cacheKeys.USER_DASHBOARD.COURSE_DISCOVERY)
      .catch((err) =>
        this.logger.error('Error deleting cache for COURSE_DISCOVERY', err),
      );
  }

  async bulkUpload(
    userAssignedCourseBulkUploadBody: UserAssignedCourseBulkUploadBody,
  ) {
    const userAssignedCourseUploadHistory =
      await this.userAssignedCourseUploadHistoryRepository.findOne({
        s3key: userAssignedCourseBulkUploadBody.metadata.key,
      });

    if (!userAssignedCourseUploadHistory) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Cannot find bulk upload history record.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const userAssignedCourseToCreate =
        this.userAssignedCourseRepository.create(
          userAssignedCourseBulkUploadBody.userAssignedCourses.map((uac) => ({
            course: { id: uac.courseId },
            dueDateTime: uac.dueDateTime,
            user: { id: uac.userId },
            assignmentType: uac.assignmentType,
          })),
        );

      await this.userAssignedCourseRepository.upsert(
        userAssignedCourseToCreate,
        ['userId', 'courseId'],
      );

      await Promise.all(
        userAssignedCourseBulkUploadBody.userAssignedCourses.map((uac) =>
          this.enrollUsersToCourse([uac.userId], uac.courseId),
        ),
      );

      userAssignedCourseUploadHistory.isProcessed = true;
      userAssignedCourseUploadHistory.status = UploadProcessStatus.COMPLETED;
    } catch (error) {
      userAssignedCourseUploadHistory.error =
        error.response?.error || JSON.stringify(error);
      userAssignedCourseUploadHistory.status = UploadProcessStatus.FAILED;

      throw error;
    } finally {
      this.userAssignedCourseUploadHistoryRepository.save(
        userAssignedCourseUploadHistory,
      );
    }

    const userCourseMap: { [userId: string]: { [courseId: string]: true } } =
      {};

    userAssignedCourseBulkUploadBody.userAssignedCourses.forEach((uac) => {
      if (!userCourseMap[uac.userId]) userCourseMap[uac.userId] = {};
      userCourseMap[uac.userId][uac.courseId] = true;
    });

    Object.keys(userCourseMap).forEach((userId) => {
      this.sendEmail(userId, Object.keys(userCourseMap[userId]));
    });

    await this.redisCacheService
      .del(cacheKeys.USER_DASHBOARD.COURSE_DISCOVERY)
      .catch((err) =>
        this.logger.error('Error deleting cache for COURSE_DISCOVERY', err),
      );
  }

  async getBulkUploadHistory(query: IListParams) {
    const searchField = query.searchField
      ? { [query.searchField]: ILike(`%${query.search}%`) }
      : {};
    const orderByField = query.orderBy ? { [query.orderBy]: query.order } : {};

    const result =
      await this.userAssignedCourseUploadHistoryRepository.findAndCount({
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
      });

    return result;
  }

  async getUploadHistoryByS3Key(
    key: string,
  ): Promise<UserAssignedCourseUploadHistory> {
    const history =
      await this.userAssignedCourseUploadHistoryRepository.findOne({
        where: {
          s3key: key,
        },
      });

    if (!history) {
      throw new NotFoundException(
        'User Assigned Course upload history does not exists',
      );
    }

    return history;
  }

  private async enrollUsersToCourse(userIds: string[], courseId: string) {
    const enrolledUsers = await this.userEnrolledCourseRepository.find({
      where: {
        user: { id: In(userIds) },
        course: { id: courseId },
      },
      relations: ['user'],
    });

    const userIdsToEnroll = userIds.filter(
      (ui) => !enrolledUsers.find((eu) => eu.user.id === ui),
    );
    const userEnrolledCourse = this.userEnrolledCourseRepository.create(
      userIdsToEnroll.map((ui) => ({
        user: { id: ui },
        course: { id: courseId },
        status: UserEnrolledCourseStatus.ENROLLED,
        percentage: 0,
      })),
    );

    await this.userEnrolledCourseRepository.save(userEnrolledCourse);
  }

  private async sendEmail(userId: User['id'], courseIds: Course['id'][]) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.subscriptions', 'subscriptions')
      .leftJoinAndSelect('subscriptions.subscriptionPlan', 'subscriptionPlan')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) return;

    const courses = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.title', 'title')
      .leftJoinAndSelect('course.courseOutline', 'courseOutline')
      .leftJoinAndSelect(
        'courseOutline.courseOutlineBundle',
        'courseOutlineBundle',
      )
      .leftJoinAndSelect(
        'courseOutlineBundle.subscriptionPlan',
        'subscriptionPlan',
      )
      .where('course.id IN (:...courseIds)', { courseIds })
      .getMany();

    // put all courses in buckets of subscription plans, later we'll send individual emails per subscription plan
    const coursesPerPlan: {
      [planId: string]: { [courseId: string]: true };
    } = {};
    // and another email for courses with no linked subscription plan
    const coursesWithNoLinkedSubMap: { [courseId: string]: Course } = {};

    // easy look up for later
    const coursesMap: { [courseId: string]: Course } = {};

    // TODO: refactor these loops better
    courses.forEach((course) => {
      coursesMap[course.id] = course;
      course.courseOutline.forEach((outline) => {
        if (outline.courseOutlineBundle.length === 0) {
          coursesWithNoLinkedSubMap[course.id] = course;
        }
        outline.courseOutlineBundle.forEach((bundle) => {
          if (bundle.subscriptionPlan.length === 0) {
            coursesWithNoLinkedSubMap[course.id] = course;
          }
          bundle.subscriptionPlan.forEach((plan) => {
            if (!coursesPerPlan[plan.id]) coursesPerPlan[plan.id] = {};
            coursesPerPlan[plan.id][course.id] = true;
          });
        });
      });
    });

    // keep track of the course subscription links, that the user actually has a plan for
    // if the user doesn't, put it inside the `coursesWithNoLinkedSubMap` instead
    const availableSubPlanIds = new Map<string, User['subscriptions'][0]>();

    Object.keys(coursesPerPlan).forEach((planId) => {
      const sub = user?.subscriptions.find(
        (subscription) => subscription.subscriptionPlanId === planId,
      );
      if (!sub) {
        Object.keys(coursesPerPlan[planId]).forEach((courseId) => {
          coursesWithNoLinkedSubMap[courseId] = coursesMap[courseId];
        });
      } else {
        availableSubPlanIds.set(planId, sub);
      }
    });

    const coursesWithNoUserSubscriptions = Object.keys(
      coursesWithNoLinkedSubMap,
    ).map((courseId) => coursesMap[courseId]);

    // use this as default if user does not have linked sub plan for those courses
    const longestExpirySubscription = [...(user?.subscriptions || [])].sort(
      (a, b) => a.endDate.getTime() - b.endDate.getTime(),
    )[0];

    const emailsToSend: {
      subscription: User['subscriptions'][0];
      courses: Course[];
    }[] = [
      {
        subscription: longestExpirySubscription,
        courses: coursesWithNoUserSubscriptions,
      },
      ...Array.from(availableSubPlanIds.values()).map((sub) => ({
        subscription: sub,
        courses: Object.keys(coursesPerPlan[sub.subscriptionPlanId]).map(
          (courseId) => coursesMap[courseId],
        ),
      })),
    ];

    emailsToSend.forEach((emailToSend) => {
      if (
        emailToSend.subscription &&
        emailToSend.courses.length > 0 &&
        user.email
      ) {
        this.notificationProducer.sendEmail({
          key: EmailNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE,
          language: user.emailNotificationLanguage,
          replacements: {
            [NV.FULL_NAME.alias]: user.fullName,
            [NV.EXPIRY_DATE.alias]: format(
              new Date(emailToSend.subscription.endDate),
              'MMM dd, yyyy HH:mm',
            ),
            [NV.COURSE_LIST.alias]: generateHtmlList(
              'ol',
              emailToSend.courses.map((course) =>
                getStringFromLanguage(
                  course.title,
                  user.emailNotificationLanguage,
                ),
              ),
            ),

            [NV.DASHBOARD_COURSES_LINK
              .alias]: `${process.env.CLIENT_BASE_URL}/dashboard/courses`,
          },
          to: user.email,
        });
      }
    });
  }
}
