import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { flatten, uniq } from 'lodash';
import { Brackets, EntityManager, Repository, TreeRepository } from 'typeorm';
import { ERROR_CODES } from '../error/errors';
import { Group } from '../group/Group.entity';
import { GroupUser } from '../group/GroupUser.entity';
import { LearningTrackAccessCheckerService } from '../learning-track/learningTrackAccessCheckerService.service';
import { OrganizationUser } from '../organization/OrganizationUser.entity';
import { Subscription } from '../payment/Subscription.entity';
import { SubscriptionPlan } from '../payment/SubscriptionPlan.entity';
import { User } from '../user/User.entity';
import { UsersService } from '../user/users.service';
import { Course } from './Course.entity';
import {
  CourseDirectAccess,
  CourseDirectAccessorType,
} from './CourseDirectAccess.entity';
import { CourseOutline } from './CourseOutline.entity';

@Injectable()
export class CourseAccessCheckerService {
  constructor(
    private readonly usersService: UsersService,
    private readonly learningTrackAccessCheckerService: LearningTrackAccessCheckerService,

    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Group)
    private groupRepository: TreeRepository<Group>,
    @InjectRepository(CourseDirectAccess)
    private courseDirectAccessRepository: Repository<CourseDirectAccess>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseOutline)
    private courseOutlineRepository: Repository<CourseOutline>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(OrganizationUser)
    private organizationUserRepository: Repository<OrganizationUser>,
    @InjectRepository(GroupUser)
    private groupUserRepository: Repository<GroupUser>,
  ) {}

  async hasAccess(
    user: User,
    params: {
      courseId?: string;
      courseOutlineId?: string;
    },
    entityManager?: EntityManager,
  ) {
    if (!user) return false;

    let courseId = params.courseId as string;
    const courseOutlineId = params.courseOutlineId as string;

    let outlineIds: string[] = [];

    if (courseId) {
      const course = await (entityManager
        ? entityManager.getRepository(Course)
        : this.courseRepository
      ).findOne({
        where: {
          id: courseId,
        },
        relations: ['courseOutline'],
      });

      outlineIds = course?.courseOutline.map((outline) => outline.id) || [];
    } else {
      const courseOutline = await (entityManager
        ? entityManager.getRepository(CourseOutline)
        : this.courseOutlineRepository
      ).findOne(courseOutlineId);

      courseId = courseOutline?.courseId || courseId;
      outlineIds.push(courseOutlineId);
    }

    const atLeastOneSubscription =
      await this.getCourseBundleSubscriptionPlanBuilder(
        user,
        outlineIds,
        entityManager,
      ).getOne();
    if (atLeastOneSubscription) return true;

    const cheapestPlan = await this.getCheapestPlan(outlineIds, entityManager);

    // if no plan is attached at all to this course outline, looks like it's free, nice
    if (!cheapestPlan) return true;

    // Check if there's any direct access given to the user.
    const hasDirectAccess = await this.hasDirectAccess(
      courseId,
      user.id,
      entityManager,
    ).catch((error) => {
      // Silence error for now
    });

    if (hasDirectAccess) return true;

    // send back cheapest plan with error, this can possibly not exist if there's no mapping yet
    // so we pass null

    const canUpgrade = await this.usersService.checkCanUpgradePlan(user);

    throw new ForbiddenException({
      ...ERROR_CODES.INVALID_SUBSCRIPTION,
      data: {
        cheapestPlan: { name: cheapestPlan.name, id: cheapestPlan.id },
        canUpgrade,
      },
    });
  }

  getCourseBundleSubscriptionPlanBuilder(
    user: User,
    outlineIds: CourseOutline['id'][],
    entityManager?: EntityManager,
  ) {
    // find if user has existing subscription that's mapped with corresponding course bundle
    const subscriptionQuery = (
      entityManager
        ? entityManager.getRepository(Subscription)
        : this.subscriptionRepository
    )
      .createQueryBuilder('subscription')
      .innerJoinAndSelect(
        'subscription.user',
        'user',
        'user.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'subscription.subscriptionPlan',
        'plan',
        'plan.isActive = :isActive',
      )
      .leftJoinAndSelect('plan.courseOutlineBundle', 'courseBundle')
      .leftJoinAndSelect('courseBundle.courseOutline', 'courseOutline')
      .where('courseOutline.id IN(:...outlineIds)')
      .andWhere('now() BETWEEN subscription.startDate AND subscription.endDate')
      .andWhere('user.id = :userId')
      .andWhere('courseBundle.isActive = :isActive')
      .setParameters({ isActive: true, outlineIds, userId: user.id });

    return subscriptionQuery;
  }

  async getSubscribedCourseIds(user: User) {
    const subscriptionQuery = this.subscriptionRepository
      .createQueryBuilder('subscription')
      .innerJoinAndSelect(
        'subscription.user',
        'user',
        'user.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'subscription.subscriptionPlan',
        'plan',
        'plan.isActive = :isActive',
      )
      .leftJoinAndSelect('plan.courseOutlineBundle', 'courseBundle')
      .leftJoinAndSelect('courseBundle.courseOutline', 'courseOutline')
      .where('now() BETWEEN subscription.startDate AND subscription.endDate')
      .andWhere('user.id = :userId')
      .andWhere('courseBundle.isActive = :isActive')
      .setParameters({ isActive: true, userId: user.id });

    const subs = await subscriptionQuery.getMany();

    return uniq(
      flatten(
        subs.map((sub) =>
          flatten(
            sub.subscriptionPlan.courseOutlineBundle.map((bundle) =>
              bundle.courseOutline.map((outline) => outline.courseId),
            ),
          ),
        ),
      ),
    );
  }

  async getCheapestPlan(
    outlineIds: CourseOutline['id'][],
    entityManager?: EntityManager,
  ) {
    const planQuery = (
      entityManager
        ? entityManager.getRepository(SubscriptionPlan)
        : this.planRepository
    )
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.courseOutlineBundle', 'courseBundle')
      .leftJoinAndSelect('courseBundle.courseOutline', 'courseOutline')
      .where('courseOutline.id IN(:...outlineIds)')
      .andWhere('courseBundle.isActive = :isActive')
      .orderBy('plan.price', 'ASC')
      .setParameters({ isActive: true, outlineIds });

    return planQuery.getOne();
  }

  async hasDirectAccess(
    courseId: string,
    userId: string,
    entityManager?: EntityManager,
  ) {
    const userRepo = entityManager
      ? entityManager.getRepository(User)
      : this.userRepository;
    const groupRepo = entityManager
      ? entityManager.getTreeRepository(Group)
      : this.groupRepository;

    const courseDirectAccessRepo = entityManager
      ? entityManager.getRepository(CourseDirectAccess)
      : this.courseDirectAccessRepository;

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
    const courseDirectAccess = await courseDirectAccessRepo
      .createQueryBuilder('cda')
      .where('cda."courseId"=:courseId', {
        courseId,
      })
      .andWhere('cda."expiryDateTime" > :now', {
        now: new Date().toISOString(),
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where(
            '("accessorId"=:userId AND "accessorType"=:userAccessorType)',
            {
              userId,
              userAccessorType: CourseDirectAccessorType.User,
            },
          );

          if (allGroupIds.length > 0) {
            qb.orWhere(
              '("accessorId" IN (:...groupIds) AND "accessorType"=:groupAccessorType)',
              {
                groupIds: allGroupIds,
                groupAccessorType: CourseDirectAccessorType.Group,
              },
            );
          }

          if (organizationIds.length > 0) {
            qb.orWhere(
              '("accessorId" IN (:...organizationIds) AND "accessorType"=:orgAccessorType)',
              {
                organizationIds,
                orgAccessorType: CourseDirectAccessorType.Organization,
              },
            );
          }
        }),
      )
      .getOne();

    // if no direct access to the course, check for direct access to any
    // learning track that the course is part of
    if (!courseDirectAccess) {
      const hasAccessToLinkedLearningTrack =
        await this.learningTrackAccessCheckerService.hasDirectAccessFromCourse(
          courseId,
          userId,
          entityManager,
        );

      return hasAccessToLinkedLearningTrack;
    }

    return !!courseDirectAccess;
  }

  async shouldOnlyShowSubscribedCourses(user: User): Promise<boolean> {
    const org = await this.organizationUserRepository
      .createQueryBuilder('orgUser')
      .leftJoinAndSelect('orgUser.organization', 'org')
      .where('org.showOnlySubscribedCourses = :showOnlySubscribedCourses', {
        showOnlySubscribedCourses: true,
      })
      .andWhere('orgUser.userId = :userId', {
        userId: user.id,
      })
      .getOne();

    if (org) return true;

    const group = await this.groupUserRepository
      .createQueryBuilder('groupUser')
      .leftJoinAndSelect('groupUser.group', 'group')
      .where('group.showOnlySubscribedCourses = :showOnlySubscribedCourses', {
        showOnlySubscribedCourses: true,
      })
      .andWhere('groupUser.userId = :userId', {
        userId: user.id,
      })
      .getOne();

    if (group) return true;

    return false;
  }

  async validateSubscribedCourseAccess(user: User, course: Course) {
    const hasDirectAccess = await this.hasDirectAccess(course.id, user.id);
    if (hasDirectAccess) return;

    const subscribedOnly = await this.shouldOnlyShowSubscribedCourses(user);

    if (subscribedOnly) {
      const plan = await this.getCourseBundleSubscriptionPlanBuilder(
        user,
        course.courseOutline.map((co) => co.id),
      ).getOne();

      if (!plan) {
        const cheapestPlan = await this.getCheapestPlan(
          course.courseOutline.map((co) => co.id),
        );
        const canUpgrade = await this.usersService.checkCanUpgradePlan(user);

        if (cheapestPlan)
          throw new ForbiddenException({
            ...ERROR_CODES.INVALID_SUBSCRIPTION,
            data: {
              cheapestPlan: { name: cheapestPlan.name, id: cheapestPlan.id },
              canUpgrade,
            },
          });
        else throw new ForbiddenException(ERROR_CODES.INVALID_SUBSCRIPTION);
      }
    }
  }
}
