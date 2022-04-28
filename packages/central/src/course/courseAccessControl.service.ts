import { InjectRepository } from '@nestjs/typeorm';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ILike, In, Repository, TreeRepository } from 'typeorm';

import { User } from '@seaccentral/core/dist/user/User.entity';
import {
  CourseDirectAccess,
  CourseDirectAccessorType,
} from '@seaccentral/core/dist/course/CourseDirectAccess.entity';
import { Group } from '@seaccentral/core/dist/group/Group.entity';
import { Course } from '@seaccentral/core/dist/course/Course.entity';
import { IListParams } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { GroupUser } from '@seaccentral/core/dist/group/GroupUser.entity';
import {
  CourseDirectAccessUploadHistory,
  UploadProcessStatus,
} from '@seaccentral/core/dist/course/CourseDirectAccessUploadHistory.entity';
import { UserEnrolledCourse } from '@seaccentral/core/dist/course/UserEnrolledCourse.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { UserEnrolledCourseStatus } from '@seaccentral/core/dist/course/UserEnrolledCourseStatus.enum';

import { CourseDirectAccessBody } from './dto/CourseDirectAccessBody.dto';
import { CourseDirectAccessQueryDto } from './dto/CourseDirectAccessQuery.dto';
import {
  CourseDirectAccessBulkUploadBody,
  CourseDirectAccessUploadFile,
} from './dto/CourseDirectAccessBulkUploadBody.dto';

@Injectable()
export class CourseAccessControlService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(UserEnrolledCourse)
    private userEnrolledCourseRepository: Repository<UserEnrolledCourse>,
    @InjectRepository(OrganizationUser)
    private organizationUserRepository: Repository<OrganizationUser>,
    @InjectRepository(GroupUser)
    private groupUserRepository: Repository<GroupUser>,
    @InjectRepository(Group)
    private groupRepository: TreeRepository<Group>,
    @InjectRepository(CourseDirectAccess)
    private courseDirectAccessRepository: Repository<CourseDirectAccess>,
    @InjectRepository(CourseDirectAccessUploadHistory)
    private courseDirectAccessUploadHistoryRepository: Repository<CourseDirectAccessUploadHistory>,
  ) {}

  async listCourseDirectAccess(query: CourseDirectAccessQueryDto) {
    const builder = this.courseDirectAccessRepository
      .createQueryBuilder('cda')
      .select('cda.id', 'id')
      .addSelect('cda.accessorType', 'accessorType')
      .addSelect('cda.accessorId', 'accessorId')
      .addSelect('cda.expiryDateTime', 'expiryDateTime')
      .addSelect('cda.createdAt', 'createdAt')
      .addSelect('course.id', 'course_id')
      .addSelect('title.id', 'course_title_id')
      .addSelect('title.nameEn', 'course_title_nameEn')
      .addSelect('title.nameTh', 'course_title_nameTh')
      .innerJoin('cda.course', 'course')
      .innerJoin('course.title', 'title')
      .where({
        accessorType: query.accessorType,
        isActive: true,
      });

    if (query.searchField === 'courseTitle' && query.search) {
      builder.andWhere(
        '(title.nameEn ILIKE :courseTitle OR title.nameTh ILIKE :courseTitle)',
        { courseTitle: `%${query.search}%` },
      );
    }

    if (query.orderBy) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      builder.orderBy(`cda.${query.orderBy}`, query.order as any);
    }

    switch (query.accessorType) {
      case CourseDirectAccessorType.User:
        builder.addSelect('u.id', 'accessor_id');
        builder.addSelect('u.firstName', 'accessor_firstName');
        builder.addSelect('u.lastName', 'accessor_lastName');
        builder.addSelect('u.email', 'accessor_email');
        builder.innerJoin(
          'user',
          'u',
          'cda."accessorId" = u.id AND u.isActive = :isActive',
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
      case CourseDirectAccessorType.Group:
        builder.addSelect('g.id', 'accessor_id');
        builder.addSelect('g.name', 'accessor_name');
        builder.innerJoin('group', 'g', 'cda."accessorId" = g.id');

        if (query.searchField === 'accessorName' && query.search) {
          builder.andWhere('g.name ILIKE :accessorName', {
            accessorName: `%${query.search}%`,
          });
        }
        break;
      case CourseDirectAccessorType.Organization:
        builder.addSelect('o.id', 'accessor_id');
        builder.addSelect('o.name', 'accessor_name');
        builder.innerJoin('organization', 'o', 'cda."accessorId" = o.id');

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
    const data = await builder.skip(query.skip).take(query.take).getRawMany();

    return { data, count };
  }

  async addDirectAccessToCourse({
    courseId,
    accessorId,
    accessorType,
    expiryDateTime,
  }: CourseDirectAccessBody) {
    const course = await this.courseRepository.findOne(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const courseDirectAccess = this.courseDirectAccessRepository.save({
      course,
      accessorId,
      accessorType,
      expiryDateTime: new Date(expiryDateTime),
    });

    const userIds = await this.getUserIdsForAccessorType(
      accessorId,
      accessorType,
    );
    await Promise.all(
      userIds.map((id) => this.enrollUserToCourse(id, courseId)),
    );

    return courseDirectAccess;
  }

  async updateCourseDirectAccess(
    id: string,
    {
      courseId,
      accessorId,
      accessorType,
      expiryDateTime,
    }: CourseDirectAccessBody,
  ) {
    const courseDirectAccess = await this.courseDirectAccessRepository.findOne(
      id,
    );

    if (!courseDirectAccess) {
      throw new NotFoundException('Course direct access not found');
    }

    const course = await this.courseRepository.findOne(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    courseDirectAccess.course = course;
    courseDirectAccess.accessorId = accessorId;
    courseDirectAccess.accessorType = accessorType;
    courseDirectAccess.expiryDateTime = new Date(expiryDateTime);

    const cda = await this.courseDirectAccessRepository.save(
      courseDirectAccess,
    );

    const userIds = await this.getUserIdsForAccessorType(
      accessorId,
      accessorType,
    );
    await Promise.all(
      userIds.map((uid) => this.enrollUserToCourse(uid, courseId)),
    );

    return cda;
  }

  async recordBulkUploadHistory(
    uploadFileDto: CourseDirectAccessUploadFile,
    user: User,
  ) {
    const history = this.courseDirectAccessUploadHistoryRepository.create({
      file: uploadFileDto.fileName,
      uploadedBy: user,
      status: UploadProcessStatus.PENDING,
      s3key: uploadFileDto.key,
    });

    await this.courseDirectAccessUploadHistoryRepository.save(history);
  }

  async bulkUpload(
    courseDirectAccessBulkUploadBody: CourseDirectAccessBulkUploadBody,
  ) {
    const courseDirectAccessUploadHistory =
      await this.courseDirectAccessUploadHistoryRepository.findOne({
        s3key: courseDirectAccessBulkUploadBody.metadata.key,
      });

    if (!courseDirectAccessUploadHistory) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Cannot find bulk upload history record.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const courseDirectAccessToCreate =
        this.courseDirectAccessRepository.create(
          courseDirectAccessBulkUploadBody.courseDirectAccess.map((cda) => ({
            course: { id: cda.courseId },
            expiryDateTime: cda.expiryDateTime,
            accessorId: cda.userId,
            accessorType: CourseDirectAccessorType.User,
          })),
        );

      await this.courseDirectAccessRepository.save(courseDirectAccessToCreate);

      await Promise.all(
        courseDirectAccessBulkUploadBody.courseDirectAccess.map((cda) =>
          this.enrollUserToCourse(cda.userId, cda.courseId),
        ),
      );

      courseDirectAccessUploadHistory.isProcessed = true;
      courseDirectAccessUploadHistory.status = UploadProcessStatus.COMPLETED;
    } catch (error) {
      courseDirectAccessUploadHistory.error =
        error.response?.error || JSON.stringify(error);
      courseDirectAccessUploadHistory.status = UploadProcessStatus.FAILED;

      throw error;
    } finally {
      this.courseDirectAccessUploadHistoryRepository.save(
        courseDirectAccessUploadHistory,
      );
    }
  }

  async getBulkUploadHistory(query: IListParams) {
    const searchField = query.searchField
      ? { [query.searchField]: ILike(`%${query.search}%`) }
      : {};
    const orderByField = query.orderBy ? { [query.orderBy]: query.order } : {};

    const result =
      await this.courseDirectAccessUploadHistoryRepository.findAndCount({
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
  ): Promise<CourseDirectAccessUploadHistory> {
    const history =
      await this.courseDirectAccessUploadHistoryRepository.findOne({
        where: {
          s3key: key,
        },
      });

    if (!history) {
      throw new HttpException(
        'Course direct access upload history does not exists',
        HttpStatus.NOT_FOUND,
      );
    }

    return history;
  }

  async deleteMany(ids: string[]) {
    await this.courseDirectAccessRepository.delete({ id: In(ids) });
  }

  async enrollUserToCourse(userId: string, courseId: string) {
    const isExisting = await this.userEnrolledCourseRepository.findOne({
      user: { id: userId },
      course: { id: courseId },
    });

    if (isExisting) {
      return;
    }

    await this.userEnrolledCourseRepository.save({
      user: { id: userId },
      course: { id: courseId },
      status: UserEnrolledCourseStatus.ENROLLED,
      percentage: 0,
    });
  }

  async getUserIdsForAccessorType(
    accessorId: string,
    accessorType: CourseDirectAccessorType,
  ) {
    let userIds: string[] = [];

    if (accessorType === CourseDirectAccessorType.User) {
      userIds[0] = accessorId;
    } else if (accessorType === CourseDirectAccessorType.Organization) {
      const organizationUsers = await this.organizationUserRepository.find({
        organization: { id: accessorId },
        isActive: true,
      });

      userIds = organizationUsers.map((ou) => ou.user.id);
    } else if (accessorType === CourseDirectAccessorType.Group) {
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
