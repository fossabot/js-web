import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadProcessStatus } from '@seaccentral/core/dist/bulk-upload/UploadProcessStatus.enum';
import { OrderType } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import {
  getPaginationRequestParams,
  getSearchRequestParams,
  getSortRequestParams,
  IListParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { GroupUser } from '@seaccentral/core/dist/group/GroupUser.entity';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { LearningTrack } from '@seaccentral/core/dist/learning-track/LearningTrack.entity';
import { UserAssignedLearningTrack } from '@seaccentral/core/dist/learning-track/UserAssignedLearningTrack.entity';
import { UserAssignedLearningTrackUploadHistory } from '@seaccentral/core/dist/learning-track/UserAssignedLearningTrackUploadHistory.entity';
import { UserEnrolledLearningTrack } from '@seaccentral/core/dist/learning-track/UserEnrolledLearningTrack.entity';
import { UserEnrolledLearningTrackStatus } from '@seaccentral/core/dist/learning-track/UserEnrolledLearningTrackStatus.enum';
import { EmailNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/EmailNotificationSubCategory.enum';
import { NotificationVariableDict as NV } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { getStringFromLanguage } from '@seaccentral/core/dist/utils/language';
import { generateHtmlList } from '@seaccentral/core/dist/utils/email';
import { format } from 'date-fns';
import { flatten } from 'lodash';
import { Brackets, ILike, In, Repository } from 'typeorm';

import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';
import { GroupService } from '../group/group.service';
import { CreateUserAssignedLearningTrackBody } from './dto/CreateUserAssignedLearningTrackBody.dto';
import { UpdateUserAssignedLearningTrackBody } from './dto/UpdateUserAssignedLearningTrackBody.dto';
import {
  UserAssignedLearningTrackBulkUploadBody,
  UserAssignedLearningTrackUploadFile,
} from './dto/UserAssignedLearningTrackBulkUploadBody.dto';
import { UserAssignedLearningTrackQueryDto } from './dto/UserAssignedLearningTrackQuery.dto';

@Injectable()
export class UserAssignedLearningTrackService {
  constructor(
    private readonly groupService: GroupService,
    private readonly notificationProducer: NotificationProducer,
    @InjectRepository(LearningTrack)
    private learningTrackRepository: Repository<LearningTrack>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(GroupUser)
    private groupUserRepository: Repository<GroupUser>,
    @InjectRepository(OrganizationUser)
    private organizationUser: Repository<OrganizationUser>,
    @InjectRepository(UserAssignedLearningTrack)
    private userAssignedLearningTrackRepository: Repository<UserAssignedLearningTrack>,
    @InjectRepository(UserEnrolledLearningTrack)
    private userEnrolledLearningTrackRepository: Repository<UserEnrolledLearningTrack>,
    @InjectRepository(UserAssignedLearningTrackUploadHistory)
    private userAssignedLearningTrackUploadHistoryRepository: Repository<UserAssignedLearningTrackUploadHistory>,
  ) {}

  async listAssignedLearningTracks(
    query: UserAssignedLearningTrackQueryDto,
    languageCode: LanguageCode,
  ) {
    const { search } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);
    const { skip, take } = getPaginationRequestParams(query);

    const builder = this.userAssignedLearningTrackRepository
      .createQueryBuilder('ualt')
      .innerJoinAndSelect('ualt.user', 'user')
      .leftJoinAndSelect('user.groupUser', 'groupUser')
      .leftJoinAndSelect('groupUser.group', 'group')
      .leftJoinAndSelect('user.organizationUser', 'organizationUser')
      .leftJoinAndSelect('organizationUser.organization', 'organization')
      .innerJoinAndSelect('ualt.learningTrack', 'learningTrack')
      .innerJoinAndSelect('learningTrack.title', 'title')
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

    if (orderBy === 'learningTrackTitle') {
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
      builder.orderBy(`ualt.${orderBy}`, order as OrderType);
    }

    const count = await builder.getCount();
    const data = await builder.skip(skip).take(take).getMany();

    return { data, count };
  }

  async create(dto: CreateUserAssignedLearningTrackBody) {
    const learningTrack = await this.learningTrackRepository.findOne(
      dto.learningTrackId,
    );

    if (!learningTrack) {
      throw new NotFoundException('Learning track not found');
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

    const userAssignedLearningTrackData =
      this.userAssignedLearningTrackRepository.create(
        [...userIdsSet].map((ui) => ({
          userId: ui,
          dueDateTime: dto.dueDateTime ?? null,
          learningTrackId: dto.learningTrackId,
          assignmentType: dto.assignmentType,
        })),
      );

    await Promise.all([
      this.userAssignedLearningTrackRepository.upsert(
        userAssignedLearningTrackData,
        ['userId', 'learningTrackId'],
      ),
      this.enrollUsersToLearningTrack([...userIdsSet], dto.learningTrackId),
    ]);

    [...userIdsSet].forEach((userId) => {
      this.notificationProducer
        .notify(
          PushNotificationSubCategoryKey.ASSIGNMENT_TO_LEARNING_TRACK,
          userId,
          { [NV.LEARNING_TRACK_NAME.alias]: learningTrack.title },
        )
        .catch();

      this.sendEmail(userId, [dto.learningTrackId]).catch();
    });
  }

  async update(id: string, dto: UpdateUserAssignedLearningTrackBody) {
    const userAssignedLearningTrack =
      await this.userAssignedLearningTrackRepository.findOne(id);

    if (!userAssignedLearningTrack) {
      throw new NotFoundException('User Assigned Learning Track not found');
    }

    if (userAssignedLearningTrack.learningTrackId !== dto.learningTrackId) {
      const existing = await this.userAssignedLearningTrackRepository.findOne({
        where: {
          userId: userAssignedLearningTrack.userId,
          learningTrackId: dto.learningTrackId,
        },
      });

      if (existing) {
        throw new ConflictException(
          'User Assigned Learning Track has existing mapping for this user and learning track.',
        );
      }
    }

    userAssignedLearningTrack.learningTrackId = dto.learningTrackId;
    userAssignedLearningTrack.assignmentType = dto.assignmentType;

    userAssignedLearningTrack.dueDateTime = dto.dueDateTime
      ? new Date(dto.dueDateTime)
      : null;

    await this.userAssignedLearningTrackRepository.save(
      userAssignedLearningTrack,
    );
  }

  async deleteMany(ids: string[]) {
    await this.userAssignedLearningTrackRepository.delete({ id: In(ids) });
  }

  async recordBulkUploadHistory(
    uploadFileDto: UserAssignedLearningTrackUploadFile,
    user: User,
  ) {
    const history =
      this.userAssignedLearningTrackUploadHistoryRepository.create({
        file: uploadFileDto.fileName,
        uploadedBy: user,
        status: UploadProcessStatus.PENDING,
        s3key: uploadFileDto.key,
      });

    await this.userAssignedLearningTrackUploadHistoryRepository.save(history);
  }

  async bulkUpload(
    userAssignedLearningTrackBulkUploadBody: UserAssignedLearningTrackBulkUploadBody,
  ) {
    const userAssignedLearningTrackUploadHistory =
      await this.userAssignedLearningTrackUploadHistoryRepository.findOne({
        s3key: userAssignedLearningTrackBulkUploadBody.metadata.key,
      });

    if (!userAssignedLearningTrackUploadHistory) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Cannot find bulk upload history record.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const userAssignedLearningTrackToCreate =
        this.userAssignedLearningTrackRepository.create(
          userAssignedLearningTrackBulkUploadBody.userAssignedLearningTracks.map(
            (ualt) => ({
              learningTrack: { id: ualt.learningTrackId },
              dueDateTime: ualt.dueDateTime,
              user: { id: ualt.userId },
              assignmentType: ualt.assignmentType,
            }),
          ),
        );

      await this.userAssignedLearningTrackRepository.upsert(
        userAssignedLearningTrackToCreate,
        ['userId', 'learningTrackId'],
      );

      await Promise.all(
        userAssignedLearningTrackBulkUploadBody.userAssignedLearningTracks.map(
          (cda) =>
            this.enrollUsersToLearningTrack([cda.userId], cda.learningTrackId),
        ),
      );

      userAssignedLearningTrackUploadHistory.isProcessed = true;
      userAssignedLearningTrackUploadHistory.status =
        UploadProcessStatus.COMPLETED;
    } catch (error) {
      userAssignedLearningTrackUploadHistory.error =
        error.response?.error || JSON.stringify(error);
      userAssignedLearningTrackUploadHistory.status =
        UploadProcessStatus.FAILED;

      throw error;
    } finally {
      this.userAssignedLearningTrackUploadHistoryRepository.save(
        userAssignedLearningTrackUploadHistory,
      );
    }

    const userLearningTrackMap: {
      [userId: string]: { [courseId: string]: true };
    } = {};

    userAssignedLearningTrackBulkUploadBody.userAssignedLearningTracks.forEach(
      (ualt) => {
        if (!userLearningTrackMap[ualt.userId])
          userLearningTrackMap[ualt.userId] = {};
        userLearningTrackMap[ualt.userId][ualt.learningTrackId] = true;
      },
    );

    Object.keys(userLearningTrackMap).forEach((userId) => {
      this.sendEmail(userId, Object.keys(userLearningTrackMap[userId]));
    });
  }

  async getBulkUploadHistory(query: IListParams) {
    const searchField = query.searchField
      ? { [query.searchField]: ILike(`%${query.search}%`) }
      : {};
    const orderByField = query.orderBy ? { [query.orderBy]: query.order } : {};

    const result =
      await this.userAssignedLearningTrackUploadHistoryRepository.findAndCount({
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
  ): Promise<UserAssignedLearningTrackUploadHistory> {
    const history =
      await this.userAssignedLearningTrackUploadHistoryRepository.findOne({
        where: {
          s3key: key,
        },
      });

    if (!history) {
      throw new NotFoundException(
        'User Assigned Learning Track upload history does not exists',
      );
    }

    return history;
  }

  private async enrollUsersToLearningTrack(
    userIds: string[],
    learningTrackId: string,
  ) {
    const enrolledUsers = await this.userEnrolledLearningTrackRepository.find({
      where: {
        user: { id: In(userIds) },
        learningTrack: { id: learningTrackId },
      },
      relations: ['user'],
    });

    const userIdsToEnroll = userIds.filter(
      (ui) => !enrolledUsers.find((eu) => eu.user.id === ui),
    );
    const userEnrolledLearningTrack =
      this.userEnrolledLearningTrackRepository.create(
        userIdsToEnroll.map((ui) => ({
          user: { id: ui },
          learningTrack: { id: learningTrackId },
          status: UserEnrolledLearningTrackStatus.ENROLLED,
        })),
      );

    await this.userEnrolledLearningTrackRepository.save(
      userEnrolledLearningTrack,
    );
  }

  private async sendEmail(
    userId: User['id'],
    learningTrackIds: LearningTrack['id'][],
  ) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.subscriptions', 'subscriptions')
      .leftJoinAndSelect('subscriptions.subscriptionPlan', 'subscriptionPlan')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) return;

    const learningTracks = await this.learningTrackRepository
      .createQueryBuilder('learningTrack')
      .leftJoinAndSelect('learningTrack.title', 'title')
      .leftJoinAndSelect('learningTrack.learningTrackSection', 'section')
      .leftJoinAndSelect('section.learningTrackSectionCourse', 'sectionCourse')
      .leftJoinAndSelect('sectionCourse.course', 'course')
      .leftJoinAndSelect('course.courseOutline', 'courseOutline')
      .leftJoinAndSelect(
        'courseOutline.courseOutlineBundle',
        'courseOutlineBundle',
      )
      .leftJoinAndSelect(
        'courseOutlineBundle.subscriptionPlan',
        'subscriptionPlan',
      )
      .where('learningTrack.id IN (:...learningTrackIds)', { learningTrackIds })
      .getMany();

    // put all learning tracks in buckets of subscription plans, later we'll send individual emails per subscription plan
    const learningTracksPerPlan: {
      [planId: string]: { [learningTrackId: string]: true };
    } = {};
    // and another email for learning tracks with no linked subscription plan
    const learningTracksWithNoLinkedSub: {
      [learningTrackId: string]: true;
    } = {};

    // easy look up for later
    const learningTracksMap: { [learningTrackId: string]: LearningTrack } = {};

    // TODO: refactor these loops better
    learningTracks.forEach((learningTrack) => {
      learningTracksMap[learningTrack.id] = learningTrack;

      if (learningTrack.learningTrackSection.length === 0)
        learningTracksWithNoLinkedSub[learningTrack.id] = true;

      learningTrack.learningTrackSection.forEach((section) => {
        if (section.learningTrackSectionCourse.length === 0)
          learningTracksWithNoLinkedSub[learningTrack.id] = true;

        section.learningTrackSectionCourse.forEach((sectionCourse) => {
          sectionCourse.course.courseOutline.forEach((outline) => {
            if (outline.courseOutlineBundle.length === 0) {
              learningTracksWithNoLinkedSub[learningTrack.id] = true;
            }
            outline.courseOutlineBundle.forEach((bundle) => {
              if (bundle.subscriptionPlan.length === 0) {
                learningTracksWithNoLinkedSub[learningTrack.id] = true;
              }
              bundle.subscriptionPlan.forEach((plan) => {
                if (!learningTracksPerPlan[plan.id])
                  learningTracksPerPlan[plan.id] = {};
                learningTracksPerPlan[plan.id][learningTrack.id] = true;
              });
            });
          });
        });
      });
    });

    // keep track of the learning tracks subscription links, that the user actually has a plan for
    // if the user doesn't, put it inside the `learningTracksWithNoLinkedSub` instead
    const availableSubPlanIds = new Map<string, User['subscriptions'][0]>();

    Object.keys(learningTracksPerPlan).forEach((planId) => {
      const sub = user?.subscriptions.find(
        (subscription) => subscription.subscriptionPlanId === planId,
      );
      if (!sub) {
        Object.keys(learningTracksPerPlan[planId]).forEach(
          (learningTrackId) => {
            learningTracksWithNoLinkedSub[learningTrackId] = true;
          },
        );
      } else {
        availableSubPlanIds.set(planId, sub);
      }
    });

    const learningTracksWithNoUserSubscriptions = Object.keys(
      learningTracksWithNoLinkedSub,
    ).map((learningTrackId) => learningTracksMap[learningTrackId]);

    // use this as default if user does not have linked sub plan for those learning tracks
    const longestExpirySubscription = [...(user?.subscriptions || [])].sort(
      (a, b) => a.endDate.getTime() - b.endDate.getTime(),
    )[0];

    const emailsToSend: {
      subscription: User['subscriptions'][0];
      learningTracks: LearningTrack[];
    }[] = [
      {
        subscription: longestExpirySubscription,
        learningTracks: learningTracksWithNoUserSubscriptions,
      },
      ...Array.from(availableSubPlanIds.values()).map((sub) => ({
        subscription: sub,
        learningTracks: Object.keys(
          learningTracksPerPlan[sub.subscriptionPlanId],
        ).map((learningTrackId) => learningTracksMap[learningTrackId]),
      })),
    ];

    emailsToSend.forEach((emailToSend) => {
      if (
        emailToSend.subscription &&
        emailToSend.learningTracks.length > 0 &&
        user.email
      ) {
        this.notificationProducer.sendEmail({
          key: EmailNotificationSubCategoryKey.ASSIGNMENT_TO_LEARNING_TRACK,
          language: user.emailNotificationLanguage,
          replacements: {
            [NV.FULL_NAME.alias]: user.fullName,
            [NV.EXPIRY_DATE.alias]: format(
              new Date(emailToSend.subscription.endDate),
              'MMM dd, yyyy HH:mm',
            ),
            [NV.LEARNING_TRACK_LIST.alias]: generateHtmlList(
              'ol',
              emailToSend.learningTracks.map((learningTrack) =>
                getStringFromLanguage(
                  learningTrack.title,
                  user.emailNotificationLanguage,
                ),
              ),
            ),

            [NV.DASHBOARD_LEARNING_TRACKS_LINK
              .alias]: `${process.env.CLIENT_BASE_URL}/dashboard/learning-tracks`,
          },
          to: user.email,
        });
      }
    });
  }
}
