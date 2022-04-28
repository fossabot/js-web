import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { CertificationType } from '@seaccentral/core/dist/certificate/certificate.enum';
import { CertificateUnlockRule } from '@seaccentral/core/dist/certificate/CertificateUnlockRule.entity';
import { UserCertificate } from '@seaccentral/core/dist/certificate/UserCertificate.entity';
import { Course } from '@seaccentral/core/dist/course/Course.entity';
import { CourseCategoryKey } from '@seaccentral/core/dist/course/CourseCategory.entity';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { UserEnrolledCourse } from '@seaccentral/core/dist/course/UserEnrolledCourse.entity';
import { UserEnrolledCourseStatus } from '@seaccentral/core/dist/course/UserEnrolledCourseStatus.enum';
import { LearningTrack } from '@seaccentral/core/dist/learning-track/LearningTrack.entity';
import { LearningTrackSection } from '@seaccentral/core/dist/learning-track/LearningTrackSection.entity';
import { LearningTrackSectionCourse } from '@seaccentral/core/dist/learning-track/LearningTrackSectionCourse.entity';
import { UserEnrolledLearningTrack } from '@seaccentral/core/dist/learning-track/UserEnrolledLearningTrack.entity';
import { UserEnrolledLearningTrackStatus } from '@seaccentral/core/dist/learning-track/UserEnrolledLearningTrackStatus.enum';
import { EmailNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/EmailNotificationSubCategory.enum';
import { NotificationVariableDict as NV } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { getAveragePercentage } from '@seaccentral/core/dist/utils/math';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';

import { differenceBy, flatten, groupBy, uniqBy } from 'lodash';
import { In, Repository } from 'typeorm';

import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';
import { CertificateService } from '../certificate/certificate.service';

@Injectable()
export class UserCourseProgressService extends TransactionFor<UserEnrolledCourse> {
  private logger = new Logger(UserCourseProgressService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationProducer: NotificationProducer,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CourseOutline)
    private readonly courseOutlineRepository: Repository<CourseOutline>,
    @InjectRepository(UserEnrolledCourse)
    private readonly userEnrolledCourseRepository: Repository<UserEnrolledCourse>,
    @InjectRepository(UserEnrolledLearningTrack)
    private readonly userEnrolledLearningTrackRepository: Repository<UserEnrolledLearningTrack>,
    @InjectRepository(CertificateUnlockRule)
    private readonly certificateUnlockRuleRepository: Repository<CertificateUnlockRule>,
    @InjectRepository(UserCertificate)
    private readonly userCertificateRepository: Repository<UserCertificate>,
    private readonly certificateService: CertificateService,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  private getAveragePercentageByCourseOutlines(
    courseOutlines: CourseOutline[],
  ) {
    if (!courseOutlines?.length) return 0;

    const percentageArray = courseOutlines.map((co) => {
      if (co.userCourseOutlineProgress?.length) {
        return co.userCourseOutlineProgress[0].percentage;
      }
      return 0;
    });
    return getAveragePercentage(percentageArray);
  }

  private async processingCourseProgressCalculation(
    user: User,
    courseId: string,
  ) {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin(
        'course.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
      )
      .leftJoin('course.category', 'category')
      .leftJoin('courseOutline.category', 'subCategory')
      .leftJoin(
        'courseOutline.userCourseOutlineProgress',
        'userCourseOutlineProgress',
        'userCourseOutlineProgress.isActive = :isActive AND userCourseOutlineProgress.userId = :userId',
      )
      .select([
        'course.id',
        'courseOutline.id',
        'category.key',
        'subCategory.key',
        'userCourseOutlineProgress.percentage',
      ])
      .where('course.id = :courseId')
      .andWhere('course.isActive = :isActive')
      .setParameters({
        userId: user.id,
        courseId,
        isActive: true,
      })
      .getOne();

    if (!course) return;

    const allCourseOutlines = course?.courseOutline;
    const categoryKey = course.category.key;

    let percentage = 0;
    let status = UserEnrolledCourseStatus.ENROLLED;

    if (categoryKey === CourseCategoryKey.LEARNING_EVENT) {
      const groups = groupBy(allCourseOutlines, (it) => it.category.key);
      const allPercentage = Object.keys(groups).map((key) => {
        return this.getAveragePercentageByCourseOutlines(groups[key]);
      });

      // Compare average percentage for all groups and use the most one.
      percentage = Math.max(...allPercentage);
    } else {
      percentage = this.getAveragePercentageByCourseOutlines(allCourseOutlines);
    }

    if (percentage >= 100) {
      percentage = 100;
      status = UserEnrolledCourseStatus.COMPLETED;

      this.notificationProducer
        .notify(
          PushNotificationSubCategoryKey.LEARNING_ACTIVITY_COURSE_COMPLETION,
          user.id,
          { [NV.COURSE_NAME.alias]: course.title },
        )
        .catch();
    } else if (percentage <= 0) {
      percentage = 0;
      status = UserEnrolledCourseStatus.ENROLLED;
    } else {
      status = UserEnrolledCourseStatus.IN_PROGRESS;
    }

    await this.userEnrolledCourseRepository.update(
      {
        user,
        course: { id: courseId },
      },
      {
        percentage,
        status,
      },
    );

    if (status === UserEnrolledCourseStatus.COMPLETED) {
      this.checkIfCompletedAllCoursesInPackage(user.id, courseId);
    }

    const userHasProgressed = status !== UserEnrolledCourseStatus.ENROLLED;
    if (userHasProgressed) {
      await this.checkCertificateUnlockRuleByCourseId(user, courseId);
    }
  }

  private async checkIfCompletedAllCoursesInPackage(
    userId: string,
    courseId: string,
  ) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.subscriptions', 'subscriptions')
      .leftJoinAndSelect('subscriptions.subscriptionPlan', 'subscriptionPlan')
      .leftJoinAndSelect(
        'subscriptionPlan.courseOutlineBundle',
        'courseOutlineBundle',
      )
      .leftJoinAndSelect('courseOutlineBundle.courseOutline', 'courseOutline')
      .leftJoinAndSelect('courseOutline.course', 'course')
      .leftJoinAndSelect('course.userEnrolledCourse', 'userEnrolledCourse')
      .where('user.id = :userId')
      .andWhere('userEnrolledCourse.userId = :userId')
      .setParameters({ userId })
      .getOne();

    user?.subscriptions.forEach((subscription) => {
      // all bundles should have each of their course outlines already completed by checking
      // each course progress

      const shouldSendEmail =
        subscription.subscriptionPlan.courseOutlineBundle.every((bundle) => {
          return (
            // recently completed course should be part of bundle
            bundle.courseOutline.some(
              (courseOutline) => courseOutline.courseId === courseId,
            ) &&
            // bundle must have all of its courses completed
            bundle.courseOutline.every((courseOutline) =>
              courseOutline.course.userEnrolledCourse.find(
                (uec) => uec.status === UserEnrolledCourseStatus.COMPLETED,
              ),
            )
          );
        });

      if (shouldSendEmail) {
        this.sendBuyMorePackagesEmail(user);
      }
    });
  }

  async sendBuyMorePackagesEmail(user: User) {
    if (user.email) {
      this.notificationProducer.sendEmail({
        key: EmailNotificationSubCategoryKey.MEMBERSHIP_BUY_NEW_PACKAGE,
        language: user.emailNotificationLanguage,
        replacements: {
          [NV.FULL_NAME.alias]: user.fullName,
          [NV.PACKAGE_PAGE_LINK.alias]: `${this.configService.get(
            'CLIENT_BASE_URL',
          )}/account/my-packages`,
        },
        to: user.email,
      });
    }
  }

  async checkCertificateUnlockRuleByCourseId(user: User, courseId: string) {
    const courseRules = await this.getMatchCourseRuleItems(courseId, user.id);
    const learningTrackRules = await this.getMatchLearningTrackRuleItems(
      courseId,
      user.id,
    );

    const rules: CertificateUnlockRule[] = [
      ...courseRules,
      ...learningTrackRules,
    ];

    const awardCertificatePromises = rules.map(async (rule) => {
      const { certificateId } = rule;

      const countUserCertificate = await this.userCertificateRepository.count({
        where: {
          user,
          certificate: { id: certificateId },
        },
      });

      if (countUserCertificate > 0) return;

      const [userCertificate, certificate] = await Promise.all([
        this.userCertificateRepository.save({
          user,
          certificate: { id: certificateId },
          completedDate: new Date(),
          isActive: true,
        }),
        this.certificateService.findOneCertificate({ id: certificateId }),
      ]);

      try {
        await this.sendUserCertificateEmail(user, userCertificate.id);
      } catch (error) {
        this.logger.error(
          `Sending Certificate Unlock Email Failed: ${JSON.stringify(error)}`,
        );
      }

      this.notificationProducer
        .notify(PushNotificationSubCategoryKey.CERTIFICATE_UNLOCKED, user.id, {
          [NV.CERTIFICATE_NAME.alias]: certificate.title,
        })
        .catch();
    });

    await Promise.all(awardCertificatePromises);
  }

  private async getMatchCourseRuleItems(courseId: string, userId: string) {
    // Get unlock rules that contain completed course.
    const unlockRules = await this.certificateUnlockRuleRepository
      .createQueryBuilder('unlockRule')
      .innerJoin(
        'unlockRule.courseRuleItems',
        'matched_item',
        'matched_item.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'unlockRule.certificate',
        'certificate',
        'certificate.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'unlockRule.courseRuleItems',
        'courseRuleItems',
        'courseRuleItems.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'courseRuleItems.course',
        'course',
        'course.isActive = :isActive',
      )
      .leftJoinAndSelect('course.title', 'title')
      .leftJoinAndSelect(
        'course.userEnrolledCourse',
        'userEnrolledCourse',
        'userEnrolledCourse.isActive = :isActive AND userEnrolledCourse.userId = :userId',
      )
      .where('unlockRule.isActive = :isActive')
      .andWhere('matched_item.courseId = :courseId')
      .setParameters({
        isActive: true,
        courseId,
        userId,
      })
      .getMany();

    // Check each courses in unlock rule if they all pass criteria in unlock rule's course items.
    const passedUnlockRules = unlockRules.filter((it) => {
      return it.courseRuleItems.every((item) => {
        if (item.course.userEnrolledCourse?.length) {
          return (
            item.course.userEnrolledCourse[0].percentage >= item.percentage
          );
        }
        return false;
      });
    });

    return passedUnlockRules;
  }

  private async getMatchLearningTrackRuleItems(
    courseId: string,
    userId: string,
  ) {
    // Get all enrolled learning track that related with completed course.
    const enrolledLearningTracks =
      await this.userEnrolledLearningTrackRepository
        .createQueryBuilder('userEnrolledLearningTrack')
        .innerJoin(
          'userEnrolledLearningTrack.learningTrack',
          'matched_learning_track',
          'matched_learning_track.isActive = :isActive',
        )
        .innerJoin(
          'matched_learning_track.learningTrackSection',
          'matched_learning_track_section',
          'matched_learning_track_section.isActive = :isActive',
        )
        .innerJoin(
          'matched_learning_track_section.learningTrackSectionCourse',
          'matched_learning_track_section_course',
        )
        .innerJoin(
          'matched_learning_track_section_course.course',
          'matched_course',
          'matched_course.isActive = :isActive',
        )
        .innerJoinAndSelect(
          'userEnrolledLearningTrack.learningTrack',
          'learningTrack',
          'learningTrack.isActive = :isActive',
        )
        .innerJoinAndSelect(
          'learningTrack.learningTrackSection',
          'learningTrackSection',
          'learningTrackSection.isActive = :isActive',
        )
        .innerJoinAndSelect(
          'learningTrackSection.learningTrackSectionCourse',
          'learningTrackSectionCourse',
        )
        .innerJoinAndSelect(
          'learningTrackSectionCourse.course',
          'course',
          'course.isActive = :isActive',
        )
        .leftJoinAndSelect(
          'course.userEnrolledCourse',
          'userEnrolledCourse',
          'userEnrolledCourse.isActive = :isActive AND userEnrolledCourse.userId = :userId',
        )
        .where('userEnrolledLearningTrack.isActive = :isActive')
        .andWhere('userEnrolledLearningTrack.userId = :userId')
        .andWhere('matched_course.id = :courseId')
        .setParameters({
          courseId,
          userId,
          isActive: true,
        })
        .getMany();

    const learningTracks = enrolledLearningTracks.map((it) => it.learningTrack);
    const learningTrackIds = learningTracks.map((it) => it.id);
    if (!learningTrackIds.length) return [];

    const unlockRules = await this.certificateUnlockRuleRepository
      .createQueryBuilder('unlockRule')
      .innerJoin(
        'unlockRule.learningTrackRuleItems',
        'matched_item',
        'matched_item.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'unlockRule.certificate',
        'certificate',
        'certificate.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'unlockRule.learningTrackRuleItems',
        'learningTrackRuleItems',
        'learningTrackRuleItems.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'learningTrackRuleItems.learningTrack',
        'learningTrack',
        'learningTrack.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'learningTrack.learningTrackSection',
        'learningTrackSection',
        'learningTrackSection.isActive = :isActive',
      )
      .innerJoinAndSelect(
        'learningTrackSection.learningTrackSectionCourse',
        'learningTrackSectionCourse',
      )
      .innerJoinAndSelect(
        'learningTrackSectionCourse.course',
        'course',
        'course.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'course.userEnrolledCourse',
        'userEnrolledCourse',
        'userEnrolledCourse.isActive = :isActive AND userEnrolledCourse.userId = :userId',
      )
      .leftJoinAndSelect('learningTrack.title', 'title')
      .where('unlockRule.isActive = :isActive')
      .andWhere('matched_item.learningTrackId IN(:...learningTrackIds)')
      .setParameters({
        isActive: true,
        userId,
        learningTrackIds,
      })
      .getMany();

    const unfiltered = await Promise.all(
      unlockRules.map(async (rule) => {
        const result = rule.learningTrackRuleItems.map((it) => {
          return this.getNewLearningTrackStatus(it.learningTrack, userId);
        });

        await this.updateLearningTrackStatus(userId, result);

        const allLTsAreCompleted = result.every(
          (x) => x.status === UserEnrolledLearningTrackStatus.COMPLETED,
        );
        return allLTsAreCompleted ? rule : undefined;
      }),
    );

    const passedUnlockRules = unfiltered.filter((item) => item !== undefined);

    // Return only passed unlock rules.
    return passedUnlockRules as CertificateUnlockRule[];
  }

  private async updateLearningTrackStatus(
    userId: string,
    data: {
      learningTrackId: string;
      status?: UserEnrolledLearningTrackStatus;
    }[],
  ) {
    const completedLTIds = data
      .filter((r) => r.status === UserEnrolledLearningTrackStatus.COMPLETED)
      .map((x) => x.learningTrackId);

    if (completedLTIds.length > 0) {
      await this.userEnrolledLearningTrackRepository.update(
        {
          learningTrackId: In(completedLTIds),
          userId,
        },
        { status: UserEnrolledLearningTrackStatus.COMPLETED },
      );
    }

    const inProgressLTIds = data
      .filter((r) => r.status === UserEnrolledLearningTrackStatus.IN_PROGRESS)
      .map((x) => x.learningTrackId);

    if (inProgressLTIds.length > 0) {
      await this.userEnrolledLearningTrackRepository.update(
        {
          learningTrackId: In(inProgressLTIds),
          userId,
        },
        { status: UserEnrolledLearningTrackStatus.IN_PROGRESS },
      );
    }
  }

  private getNewLearningTrackStatus(
    learningTrack: LearningTrack,
    userId: string,
  ): {
    learningTrackId: string;
    status?: UserEnrolledLearningTrackStatus;
  } {
    const allCourses = learningTrack.learningTrackSection.reduce(
      (prev: LearningTrackSectionCourse[], current: LearningTrackSection) => [
        ...prev,
        ...current.learningTrackSectionCourse,
      ],
      [] as LearningTrackSectionCourse[],
    );

    const result: {
      learningTrackId: string;
      status?: UserEnrolledLearningTrackStatus;
    } = { learningTrackId: learningTrack.id, status: undefined };

    let newStatus;

    const complete = allCourses.map((c) => {
      // Dont take optional course into consideration
      if (!c.isRequired) return true;

      if (c.course.userEnrolledCourse?.length < 1) return false;
      const enrollment = c.course.userEnrolledCourse.find(
        (uec) => uec.userId === userId,
      );
      if (!enrollment) return false;
      if (enrollment.percentage > 0)
        newStatus = UserEnrolledLearningTrackStatus.IN_PROGRESS;

      return enrollment.percentage === 100;
    });

    const allCoursesIsComplete = complete.every((x) => x === true);
    if (allCoursesIsComplete) {
      result.status = UserEnrolledLearningTrackStatus.COMPLETED;

      this.notificationProducer
        .notify(
          PushNotificationSubCategoryKey.LEARNING_ACTIVITY_LEARNING_TRACK_COMPLETION,
          userId,
          {
            [NV.LEARNING_TRACK_NAME.alias]: learningTrack.title,
          },
        )
        .catch();
    } else {
      result.status = newStatus;
    }

    return result;
  }

  // TODO: unused method, consider to remove
  private getLearningTrackPercentage(learningTrack: LearningTrack) {
    const learningTrackSections = flatten(learningTrack.learningTrackSection);
    const learningTrackSectionCourses = flatten(
      learningTrackSections.map(
        (section) => section.learningTrackSectionCourse,
      ),
    );
    const courses = learningTrackSectionCourses.map((it) => it.course);
    const sum = courses
      .map((c) =>
        c.userEnrolledCourse?.length ? c.userEnrolledCourse[0].percentage : 0,
      )
      .reduce((prev, current) => prev + current, 0);
    const percentage = Math.ceil(sum / courses.length);
    return percentage > 100 ? 100 : percentage;
  }

  private async sendUserCertificateEmail(
    user: User,
    userCertificateId: UserCertificate['id'],
  ) {
    if (process.env.NODE_ENV === 'test') return;

    if (!user.email) return;

    const userCertificate = await this.userCertificateRepository.findOne(
      userCertificateId,
    );

    if (!userCertificate) return;

    this.notificationProducer.sendEmail({
      key: EmailNotificationSubCategoryKey.CERTIFICATE_UNLOCKED,
      language: user.emailNotificationLanguage,
      replacements: {
        [NV.FULL_NAME.alias]: user.fullName,
        [NV.CERTIFICATE_NAME.alias]: userCertificate.certificate.title,
        [NV.CERTIFICATE_LINK.alias]: `${this.configService.get(
          'CLIENT_BASE_URL',
        )}/dashboard/certificate`,
      },
      to: user.email,
    });
  }

  async recalculateByCourse(user: User, courseId: string) {
    await this.processingCourseProgressCalculation(user, courseId);
  }

  async recalculateByCourseOutlineAndUserId(
    userId: string,
    courseOutlineId: string,
  ) {
    const user = await this.userRepository.findOne(userId);
    if (user) {
      await this.recalculateByCourseOutline(user, courseOutlineId);
    }
  }

  async recalculateByCourseOutline(user: User, courseOutlineId: string) {
    const courseOutline = await this.courseOutlineRepository
      .createQueryBuilder('courseOutline')
      .innerJoinAndSelect('courseOutline.course', 'course')
      .select(['courseOutline.id', 'course.id'])
      .where({
        id: courseOutlineId,
        isActive: true,
      })
      .getOne();

    if (!courseOutline?.course?.id) return;

    const courseId = courseOutline.course.id;

    await this.processingCourseProgressCalculation(user, courseId);
  }

  async evaluateUserCertificate(certificateId: string) {
    const unlockRules = await this.certificateUnlockRuleRepository
      .createQueryBuilder('unlockRule')
      .leftJoinAndSelect('unlockRule.certificate', 'certificate')
      .leftJoinAndSelect('certificate.userCertificate', 'uc')
      .leftJoinAndSelect('uc.user', 'ucUser')
      .leftJoinAndSelect('unlockRule.courseRuleItems', 'courseRuleItems')
      .leftJoinAndSelect('courseRuleItems.course', 'course')
      .leftJoinAndSelect('course.userEnrolledCourse', 'uec')
      .leftJoinAndSelect('uec.user', 'uecUser')
      .leftJoinAndSelect(
        'unlockRule.learningTrackRuleItems',
        'learningTrackRuleItems',
      )
      .leftJoinAndSelect('learningTrackRuleItems.learningTrack', 'lt')
      .leftJoinAndSelect('lt.userEnrolledLearningTrack', 'uelt')
      .leftJoinAndSelect('uelt.user', 'ueltUser')
      .leftJoinAndSelect('lt.learningTrackSection', 'ltSection')
      .leftJoinAndSelect('ltSection.learningTrackSectionCourse', 'ltsc')
      .leftJoinAndSelect('ltsc.course', 'ltscCourse')
      .where('unlockRule.certificateId = :certificateId', { certificateId })
      .andWhere('unlockRule.isActive = :isActive', { isActive: true })
      .getMany();

    if (unlockRules.length < 1) return;

    const usersWhoMightGetCertificate = this.checkRules(unlockRules);

    // No further process needed if no potential certified users.
    if (usersWhoMightGetCertificate.length < 1) return;

    // Just need an any course from rule to satisfy existing function parameter.
    const courseId = this.getACourseFromUnlockRule(unlockRules);

    const promises = usersWhoMightGetCertificate.map(async (user) =>
      this.checkCertificateUnlockRuleByCourseId(user, courseId),
    );

    await Promise.all(promises);
  }

  private getACourseFromUnlockRule(
    unlockRules: CertificateUnlockRule[],
  ): string {
    const unlockRule = unlockRules[0];

    if (unlockRule.unlockType === CertificationType.COURSE) {
      return unlockRule.courseRuleItems[0].courseId;
    }

    // Get a required course from learning track in the rule.
    return unlockRule.learningTrackRuleItems[0].learningTrack.learningTrackSection
      .filter((section) =>
        section.learningTrackSectionCourse.some(
          (sectionCourse) => sectionCourse.isRequired,
        ),
      )[0]
      .learningTrackSectionCourse.filter((c) => c.isRequired)[0].course.id;
  }

  private getPotentialCertUsers(unlockRule: CertificateUnlockRule): User[] {
    let userIdsWhoMightGetCertificate: User[] = [];
    if (unlockRule.unlockType === CertificationType.LEARNING_TRACK) {
      // We can check enrolled users from just 1 learning track. Because users who potentially get certificate will present in every learning track.
      const enrolledUsers =
        unlockRule.learningTrackRuleItems[0].learningTrack.userEnrolledLearningTrack.map(
          (uelt) => uelt.user,
        );

      const enrolledUsersWhoHasNoCert = differenceBy(
        enrolledUsers,
        unlockRule.certificate.userCertificate.map((uc) => uc.user),
        (u) => u.id,
      );

      userIdsWhoMightGetCertificate = enrolledUsersWhoHasNoCert;
    } else if (unlockRule.unlockType === CertificationType.COURSE) {
      const enrolledUserWhoHaveCompletedCourse =
        unlockRule.courseRuleItems[0].course.userEnrolledCourse
          .filter((uec) => uec.percentage === 100)
          .map((uec) => uec.user);

      const enrolledUsersWhoHasNoCert = differenceBy(
        enrolledUserWhoHaveCompletedCourse,
        unlockRule.certificate.userCertificate.map((uc) => uc.user),
        (u) => u.id,
      );

      userIdsWhoMightGetCertificate = enrolledUsersWhoHasNoCert;
    }

    return userIdsWhoMightGetCertificate;
  }

  private checkRules(unlockRules: CertificateUnlockRule[]): User[] {
    // Get list of user who potentially receive certificate from this update
    let usersWhoMightGetCertificate: User[] = [];
    unlockRules.forEach((unlockRule: CertificateUnlockRule) => {
      const whoMightGetCertificate = this.getPotentialCertUsers(unlockRule);

      usersWhoMightGetCertificate = [
        ...usersWhoMightGetCertificate,
        ...whoMightGetCertificate,
      ];
    });

    usersWhoMightGetCertificate = uniqBy(
      usersWhoMightGetCertificate,
      (user) => user.id,
    );

    return usersWhoMightGetCertificate;
  }
}
