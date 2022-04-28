import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { SYSTEM_ROLES } from '@seaccentral/core/dist/utils/constants';
import { CourseStatus } from '@seaccentral/core/dist/course/courseStatus.enum';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getAll() {
    // TODO: This API might need pagination later.
    const instructors = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.userRoles', 'userRoles')
      .innerJoinAndSelect('userRoles.role', 'role')
      .where(
        'user.isActive = :isActive AND user.isActivated = :isActivated AND role.name = :roleName',
        {
          isActive: true,
          isActivated: true,
          roleName: SYSTEM_ROLES.INSTRUCTOR,
        },
      )
      .orderBy('user.firstName')
      .addOrderBy('user.lastName')
      .getMany();
    return instructors;
  }

  async getInstructor(id: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.userRoles', 'userRoles')
      .innerJoinAndSelect('userRoles.role', 'role')
      .where(
        'user.id = :id AND user.isActive = :isActive AND user.isActivated = :isActivated AND role.name = :roleName',
        {
          isActive: true,
          isActivated: true,
          roleName: SYSTEM_ROLES.INSTRUCTOR,
          id,
        },
      )
      .getOneOrFail();
  }

  async getByIds(ids: string[], withCourses = false) {
    if (ids.length < 1) {
      return [];
    }

    const instructorQuery = this.usersRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.userRoles', 'userRoles')
      .innerJoinAndSelect('userRoles.role', 'role')
      .where(
        'user.isActive = :isActive AND user.isActivated = :isActivated AND role.name = :roleName AND user.id IN (:...ids)',
        {
          ids,
          isActive: true,
          isActivated: true,
          roleName: SYSTEM_ROLES.INSTRUCTOR,
        },
      )
      .orderBy('user.firstName')
      .addOrderBy('user.lastName');

    if (withCourses) {
      instructorQuery
        .leftJoinAndSelect(
          'user.courseSessionInstructors',
          'courseSessionInstructors',
        )
        .leftJoinAndSelect(
          'courseSessionInstructors.courseSession',
          'courseSessions',
          'courseSessions.isActive = :isActive',
        )
        .leftJoinAndSelect('courseSessions.courseOutline', 'courseOutline')
        .leftJoinAndSelect(
          'courseOutline.course',
          'course',
          'course.isActive = :isActive AND course.status = :status',
        )
        .setParameters({
          isActive: true,
          status: CourseStatus.Published,
        });
    }

    return instructorQuery.getMany();
  }
}
