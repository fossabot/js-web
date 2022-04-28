import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { flatten, uniq } from 'lodash';
import {
  Brackets,
  EntityManager,
  In,
  Repository,
  TreeRepository,
} from 'typeorm';
import { Group } from '../group/Group.entity';
import { User } from '../user/User.entity';
import {
  LearningTrackDirectAccess,
  LearningTrackDirectAccessorType,
} from './LearningTrackDirectAccess.entity';
import { LearningTrackSectionCourse } from './LearningTrackSectionCourse.entity';

@Injectable()
export class LearningTrackAccessCheckerService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Group)
    private groupRepository: TreeRepository<Group>,
    @InjectRepository(LearningTrackDirectAccess)
    private learningTrackDirectAccessRepository: Repository<LearningTrackDirectAccess>,
    @InjectRepository(LearningTrackSectionCourse)
    private learningTrackSectionCourseRepository: Repository<LearningTrackSectionCourse>,
  ) {}

  async hasDirectAccessFromCourse(
    courseIdorIds: string | string[],
    userId: string,
    entityManager?: EntityManager,
  ) {
    const learningTrackSectionCourseRepo = entityManager
      ? entityManager.getRepository(LearningTrackSectionCourse)
      : this.learningTrackSectionCourseRepository;

    const courseIds =
      typeof courseIdorIds === 'string' ? [courseIdorIds] : courseIdorIds;

    const learningTrackSectionCourses =
      await learningTrackSectionCourseRepo.find({
        where: {
          course: {
            id: In(courseIds),
          },
        },
        relations: ['learningTrackSection'],
      });

    const learningTrackIds = uniq(
      learningTrackSectionCourses.map(
        (ltsc) => ltsc.learningTrackSection.learningTrackId,
      ),
    );
    const hasAccess = await Promise.all(
      learningTrackIds.map((ltid) =>
        this.hasDirectAccess(ltid, userId, entityManager).catch((error) => {
          // Silence error for now
        }),
      ),
    );

    return hasAccess.some((access) => !!access);
  }

  async hasDirectAccess(
    learningTrackId: string,
    userId: string,
    entityManager?: EntityManager,
  ) {
    const userRepo = entityManager
      ? entityManager.getRepository(User)
      : this.userRepository;
    const groupRepo = entityManager
      ? entityManager.getTreeRepository(Group)
      : this.groupRepository;

    const learningTrackDirectAccessRepo = entityManager
      ? entityManager.getRepository(LearningTrackDirectAccess)
      : this.learningTrackDirectAccessRepository;

    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ['groupUser', 'organizationUser'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const groups = user.groupUser.map((gu) => gu.group);
    const groupWithAncestors = await Promise.all(
      groups.map((g) => groupRepo.findAncestors(g)),
    );
    const allGroupIds = flatten(groupWithAncestors).map((gwa) => gwa.id);

    const organizationIds = user.organizationUser.map(
      (ou) => ou.organization.id,
    );

    // TODO: Potentially slow query. Might be improved in the future by caching the permissions.
    const learningTrackDirectAccess = await learningTrackDirectAccessRepo
      .createQueryBuilder('ltda')
      .where('ltda."learningTrackId"=:learningTrackId', {
        learningTrackId,
      })
      .andWhere('ltda."expiryDateTime" > :now', {
        now: new Date().toISOString(),
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where(
            '("accessorId"=:userId AND "accessorType"=:userAccessorType)',
            {
              userId,
              userAccessorType: LearningTrackDirectAccessorType.User,
            },
          );

          if (allGroupIds.length > 0) {
            qb.orWhere(
              '("accessorId" IN (:...groupIds) AND "accessorType"=:groupAccessorType)',
              {
                groupIds: allGroupIds,
                groupAccessorType: LearningTrackDirectAccessorType.Group,
              },
            );
          }

          if (organizationIds.length > 0) {
            qb.orWhere(
              '("accessorId" IN (:...organizationIds) AND "accessorType"=:orgAccessorType)',
              {
                organizationIds,
                orgAccessorType: LearningTrackDirectAccessorType.Organization,
              },
            );
          }
        }),
      )
      .getOne();

    return !!learningTrackDirectAccess;
  }
}
