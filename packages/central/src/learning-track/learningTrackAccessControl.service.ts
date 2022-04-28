import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadProcessStatus } from '@seaccentral/core/dist/course/CourseSessionUploadHistory.entity';
import { IListParams } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { Group } from '@seaccentral/core/dist/group/Group.entity';
import { GroupUser } from '@seaccentral/core/dist/group/GroupUser.entity';
import { LearningTrack } from '@seaccentral/core/dist/learning-track/LearningTrack.entity';
import {
  LearningTrackDirectAccess,
  LearningTrackDirectAccessorType,
} from '@seaccentral/core/dist/learning-track/LearningTrackDirectAccess.entity';
import { LearningTrackDirectAccessUploadHistory } from '@seaccentral/core/dist/learning-track/LearningTrackDirectAccessUploadHistory.entity';
import { UserEnrolledLearningTrack } from '@seaccentral/core/dist/learning-track/UserEnrolledLearningTrack.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { flatten } from 'lodash';
import { ILike, In, Repository, TreeRepository } from 'typeorm';
import { CourseAccessControlService } from '../course/courseAccessControl.service';
import { LearningTrackDirectAccessBody } from './dto/LearningTrackDirectAccessBody.dto';
import {
  LearningTrackDirectAccessBulkUploadBody,
  LearningTrackDirectAccessUploadFile,
} from './dto/LearningTrackDirectAccessBulkUploadBody.dto';
import { LearningTrackDirectAccessQueryDto } from './dto/LearningTrackDirectAccessQuery.dto';
import { IlearningTrackDirectAccessRaw } from './dto/LearningTrackDirectAccessResponse.dto';

@Injectable()
export class LearningTrackAccessControlService {
  constructor(
    private readonly courseAccessControlService: CourseAccessControlService,

    @InjectRepository(LearningTrack)
    private learningTrackRepository: Repository<LearningTrack>,
    @InjectRepository(UserEnrolledLearningTrack)
    private userEnrolledLearningTrackRepository: Repository<UserEnrolledLearningTrack>,
    @InjectRepository(OrganizationUser)
    private organizationUserRepository: Repository<OrganizationUser>,
    @InjectRepository(GroupUser)
    private groupUserRepository: Repository<GroupUser>,
    @InjectRepository(Group)
    private groupRepository: TreeRepository<Group>,
    @InjectRepository(LearningTrackDirectAccess)
    private learningTrackDirectAccessRepository: Repository<LearningTrackDirectAccess>,
    @InjectRepository(LearningTrackDirectAccessUploadHistory)
    private learningTrackDirectAccessUploadHistoryRepository: Repository<LearningTrackDirectAccessUploadHistory>,
  ) {}

  async listLearningTrackDirectAccess(
    query: LearningTrackDirectAccessQueryDto,
  ) {
    const builder = this.learningTrackDirectAccessRepository
      .createQueryBuilder('ltda')
      .select('ltda.id', 'id')
      .addSelect('ltda.accessorType', 'accessorType')
      .addSelect('ltda.accessorId', 'accessorId')
      .addSelect('ltda.expiryDateTime', 'expiryDateTime')
      .addSelect('ltda.createdAt', 'createdAt')
      .addSelect('learningTrack.id', 'learning_track_id')
      .addSelect('title.id', 'learning_track_title_id')
      .addSelect('title.nameEn', 'learning_track_title_nameEn')
      .addSelect('title.nameTh', 'learning_track_title_nameTh')
      .innerJoin('ltda.learningTrack', 'learningTrack')
      .innerJoin('learningTrack.title', 'title')
      .where({
        accessorType: query.accessorType,
        isActive: true,
      });

    if (query.searchField === 'learningTrackTitle' && query.search) {
      builder.andWhere(
        '(title.nameEn ILIKE :learningTrackTitle OR title.nameTh ILIKE :learningTrackTitle)',
        { learningTrackTitle: `%${query.search}%` },
      );
    }

    if (query.orderBy) {
      builder.orderBy(`ltda.${query.orderBy}`, query.order as any);
    }

    switch (query.accessorType) {
      case LearningTrackDirectAccessorType.User:
        builder.addSelect('u.id', 'accessor_id');
        builder.addSelect('u.firstName', 'accessor_firstName');
        builder.addSelect('u.lastName', 'accessor_lastName');
        builder.addSelect('u.email', 'accessor_email');
        builder.innerJoin(
          'user',
          'u',
          'ltda."accessorId" = u.id AND u.isActive = :isActive',
        );

        if (query.searchField === 'userEmail' && query.search) {
          builder.andWhere('u.email ILIKE :userEmail', {
            userEmail: `%${query.search}%`,
          });
        }

        if (query.searchField === 'accessorName' && query.search) {
          builder.andWhere(
            "(u.firstName ILIKE :accessorName OR u.lastName ILIKE :accessorName OR TRIM(CONCAT(u.firstName, ' ', u.lastName)) ILIKE :accessorName)",
            {
              accessorName: `%${query.search}%`,
            },
          );
        }
        break;
      case LearningTrackDirectAccessorType.Group:
        builder.addSelect('g.id', 'accessor_id');
        builder.addSelect('g.name', 'accessor_name');
        builder.innerJoin('group', 'g', 'ltda."accessorId" = g.id');

        if (query.searchField === 'accessorName' && query.search) {
          builder.andWhere('g.name ILIKE :accessorName', {
            accessorName: `%${query.search}%`,
          });
        }
        break;
      case LearningTrackDirectAccessorType.Organization:
        builder.addSelect('o.id', 'accessor_id');
        builder.addSelect('o.name', 'accessor_name');
        builder.innerJoin('organization', 'o', 'ltda."accessorId" = o.id');

        if (query.searchField === 'accessorName' && query.search) {
          builder.andWhere('o.name ILIKE :accessorName', {
            accessorName: `%${query.search}%`,
          });
        }
        break;
      default:
        break;
    }
    builder.setParameters({ isActive: true });

    const count = await builder.getCount();
    const data = await builder
      .skip(query.skip)
      .take(query.take)
      .getRawMany<IlearningTrackDirectAccessRaw>();

    return { data, count };
  }

  async addDirectAccessToLearningTrack({
    learningTrackId,
    accessorId,
    accessorType,
    expiryDateTime,
  }: LearningTrackDirectAccessBody) {
    const learningTrack = await this.learningTrackRepository
      .createQueryBuilder('learningTrack')
      .leftJoinAndSelect(
        'learningTrack.learningTrackSection',
        'learningTrackSection',
      )
      .leftJoinAndSelect(
        'learningTrackSection.learningTrackSectionCourse',
        'learningTrackSectionCourse',
      )
      .where('learningTrack.id = :learningTrackId', { learningTrackId })
      .getOne();

    if (!learningTrack) {
      throw new NotFoundException('Learning track not found');
    }

    const learningTrackDirectAccess =
      this.learningTrackDirectAccessRepository.save({
        learningTrack,
        accessorId,
        accessorType,
        expiryDateTime: new Date(expiryDateTime),
      });

    const userIds = await this.getUserIdsForAccessorType(
      accessorId,
      accessorType,
    );

    const courseIds = flatten(
      learningTrack.learningTrackSection.map((section) =>
        section.learningTrackSectionCourse.map(
          // eslint-disable-next-line
          // @ts-ignore
          (sectionCourse) => sectionCourse.courseId,
        ),
      ),
    );

    const enrollPromises: Promise<void>[] = [];

    userIds.forEach((userId) => {
      enrollPromises.push(
        this.enrollUserToLearningTrack(userId, learningTrackId),
      );
      courseIds.forEach((courseId) => {
        enrollPromises.push(
          this.courseAccessControlService.enrollUserToCourse(userId, courseId),
        );
      });
    });

    await Promise.all(enrollPromises);

    return learningTrackDirectAccess;
  }

  async updateLearningTrackDirectAccess(
    id: string,
    {
      learningTrackId,
      accessorId,
      accessorType,
      expiryDateTime,
    }: LearningTrackDirectAccessBody,
  ) {
    const learningTrackDirectAccess =
      await this.learningTrackDirectAccessRepository.findOne(id);

    if (!learningTrackDirectAccess) {
      throw new NotFoundException('Learning Track direct access not found');
    }

    const learningTrack = await this.learningTrackRepository.findOne(
      learningTrackId,
    );

    if (!learningTrack) {
      throw new NotFoundException('Learning Track not found');
    }

    learningTrackDirectAccess.learningTrack = learningTrack;
    learningTrackDirectAccess.accessorId = accessorId;
    learningTrackDirectAccess.accessorType = accessorType;
    learningTrackDirectAccess.expiryDateTime = new Date(expiryDateTime);

    const ltda = await this.learningTrackDirectAccessRepository.save(
      learningTrackDirectAccess,
    );

    const userIds = await this.getUserIdsForAccessorType(
      accessorId,
      accessorType,
    );
    await Promise.all(
      userIds.map((uid) =>
        this.enrollUserToLearningTrack(uid, learningTrackId),
      ),
    );

    return ltda;
  }

  async recordBulkUploadHistory(
    uploadFileDto: LearningTrackDirectAccessUploadFile,
    user: User,
  ) {
    const history =
      this.learningTrackDirectAccessUploadHistoryRepository.create({
        file: uploadFileDto.fileName,
        uploadedBy: user,
        status: UploadProcessStatus.PENDING,
        s3key: uploadFileDto.key,
      });

    await this.learningTrackDirectAccessUploadHistoryRepository.save(history);
  }

  async bulkUpload(
    learningTrackDirectAccessBulkUploadBody: LearningTrackDirectAccessBulkUploadBody,
  ) {
    const learningTrackDirectAccessUploadHistory =
      await this.learningTrackDirectAccessUploadHistoryRepository.findOne({
        s3key: learningTrackDirectAccessBulkUploadBody.metadata.key,
      });

    if (!learningTrackDirectAccessUploadHistory) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Cannot find bulk upload history record.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      await Promise.all(
        learningTrackDirectAccessBulkUploadBody.learningTrackDirectAccess.map(
          (ltda) =>
            this.addDirectAccessToLearningTrack({
              learningTrackId: ltda.learningTrackId,
              accessorId: ltda.userId,
              accessorType: LearningTrackDirectAccessorType.User,
              expiryDateTime: String(ltda.expiryDateTime),
            }),
        ),
      );

      learningTrackDirectAccessUploadHistory.isProcessed = true;
      learningTrackDirectAccessUploadHistory.status =
        UploadProcessStatus.COMPLETED;
    } catch (error) {
      learningTrackDirectAccessUploadHistory.error =
        error.response?.error || JSON.stringify(error);
      learningTrackDirectAccessUploadHistory.status =
        UploadProcessStatus.FAILED;

      throw error;
    } finally {
      this.learningTrackDirectAccessUploadHistoryRepository.save(
        learningTrackDirectAccessUploadHistory,
      );
    }
  }

  async getBulkUploadHistory(query: IListParams) {
    const searchField = query.searchField
      ? { [query.searchField]: ILike(`%${query.search}%`) }
      : {};
    const orderByField = query.orderBy ? { [query.orderBy]: query.order } : {};

    const result =
      await this.learningTrackDirectAccessUploadHistoryRepository.findAndCount({
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
  ): Promise<LearningTrackDirectAccessUploadHistory> {
    const history =
      await this.learningTrackDirectAccessUploadHistoryRepository.findOne({
        where: {
          s3key: key,
        },
      });

    if (!history) {
      throw new HttpException(
        'Learning Track direct access upload history does not exists',
        HttpStatus.NOT_FOUND,
      );
    }

    return history;
  }

  async deleteMany(ids: string[]) {
    await this.learningTrackDirectAccessRepository.delete({ id: In(ids) });
  }

  async enrollUserToLearningTrack(userId: string, learningTrackId: string) {
    const isExisting = await this.userEnrolledLearningTrackRepository.findOne({
      user: { id: userId },
      learningTrack: { id: learningTrackId },
    });

    if (isExisting) {
      return;
    }

    await this.userEnrolledLearningTrackRepository.save({
      user: { id: userId },
      learningTrack: { id: learningTrackId },
      percentage: 0,
    });
  }

  async getUserIdsForAccessorType(
    accessorId: string,
    accessorType: LearningTrackDirectAccessorType,
  ) {
    let userIds: string[] = [];

    if (accessorType === LearningTrackDirectAccessorType.User) {
      userIds[0] = accessorId;
    } else if (accessorType === LearningTrackDirectAccessorType.Organization) {
      const organizationUsers = await this.organizationUserRepository.find({
        organization: { id: accessorId },
        isActive: true,
      });

      userIds = organizationUsers.map((ou) => ou.user.id);
    } else if (accessorType === LearningTrackDirectAccessorType.Group) {
      const group = await this.groupRepository.findOne({ id: accessorId });
      if (!group) return [];

      const groupWithDecendents = await this.groupRepository.findDescendants(
        group,
      );

      const groupUsers = await this.groupUserRepository.find({
        where: {
          group: {
            id: In(groupWithDecendents.map((gwd) => gwd.id)),
            isActive: true,
          },
        },
        relations: ['user'],
      });

      userIds = groupUsers.map((gu) => gu.user.id);
    }

    return userIds;
  }
}
