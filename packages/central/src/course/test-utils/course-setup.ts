import { TestingModule } from '@nestjs/testing';
import { Course } from '@seaccentral/core/dist/course/Course.entity';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import {
  CourseCategory,
  CourseCategoryKey,
} from '@seaccentral/core/dist/course/CourseCategory.entity';
import {
  CourseSubCategory,
  CourseSubCategoryKey,
} from '@seaccentral/core/dist/course/CourseSubCategory.entity';
import { UserEnrolledCourse } from '@seaccentral/core/dist/course/UserEnrolledCourse.entity';
import { UserCourseOutlineProgress } from '@seaccentral/core/dist/course/UserCourseOutlineProgress.entity';
import { CourseLanguage } from '@seaccentral/core/dist/course/courseLanguage.enum';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { CourseStatus } from '@seaccentral/core/dist/course/courseStatus.enum';
import {
  LearningWay,
  LearningWayKey,
} from '@seaccentral/core/dist/learning-way/LearningWay.entity';
import { UserEnrolledCourseStatus } from '@seaccentral/core/dist/course/UserEnrolledCourseStatus.enum';
import { EntityManager } from 'typeorm';
import faker from 'faker';
import { UserCourseOutlineProgressStatus } from '@seaccentral/core/dist/course/UserCourseOutlineProgressStatus.enum';
import { UserCertificate } from '@seaccentral/core/dist/certificate/UserCertificate.entity';
import { Certificate } from '@seaccentral/core/dist/certificate/certificate.entity';
import { CertificateUnlockRule } from '@seaccentral/core/dist/certificate/CertificateUnlockRule.entity';
import { CertificateUnlockRuleCourseItem } from '@seaccentral/core/dist/certificate/CertificateUnlockRuleCourseItem.entity';
import {
  CertificationOrientation,
  CertificationType,
} from '@seaccentral/core/dist/certificate/certificate.enum';

export function createUser(app: TestingModule) {
  return app
    .get(EntityManager)
    .getRepository(User)
    .create({
      email: faker.internet.email(),
      firstName: 'John',
      lastName: 'Doe',
    })
    .save();
}

export async function getOnlineLearningCourse(
  app: TestingModule,
  percentageArray: number[],
) {
  const entityManager = app.get(EntityManager);
  const courseRepository = entityManager.getRepository(Course);
  const courseOutlineRepository = entityManager.getRepository(CourseOutline);
  const courseCategoryRepository = entityManager.getRepository(CourseCategory);
  const courseSubCategoryRepository =
    entityManager.getRepository(CourseSubCategory);
  const learningWayRepository = entityManager.getRepository(LearningWay);

  const category = await courseCategoryRepository.save({
    name: 'Online Learning',
    key: CourseCategoryKey.ONLINE_LEARNING,
  });

  const subCategory = await courseSubCategoryRepository.save({
    name: 'Video',
    key: CourseSubCategoryKey.VIDEO,
    courseCategory: category,
  });

  const learningWay = await learningWayRepository.save({
    name: 'Online',
    key: LearningWayKey.ONLINE,
  });

  const course = await courseRepository.save({
    category,
    availableLanguage: CourseLanguage.ALL,
    status: CourseStatus.Published,
    isPublic: true,
    isActive: true,
  });

  course.courseOutline = await Promise.all(
    percentageArray.map((_, index) =>
      courseOutlineRepository.save({
        course: { id: course.id },
        category: subCategory,
        learningWay,
        part: index + 1,
      }),
    ),
  );

  return course;
}

export async function getVirtualCourse(
  app: TestingModule,
  percentageArray: number[],
) {
  const entityManager = app.get(EntityManager);
  const courseRepository = entityManager.getRepository(Course);
  const courseOutlineRepository = entityManager.getRepository(CourseOutline);
  const courseCategoryRepository = entityManager.getRepository(CourseCategory);
  const courseSubCategoryRepository =
    entityManager.getRepository(CourseSubCategory);
  const learningWayRepository = entityManager.getRepository(LearningWay);

  const category = await courseCategoryRepository.save({
    name: 'Learning Event',
    key: CourseCategoryKey.LEARNING_EVENT,
  });

  const subCategory = await courseSubCategoryRepository.save({
    name: 'Virtual',
    key: CourseSubCategoryKey.VIRTUAL,
    courseCategory: category,
  });

  const learningWay = await learningWayRepository.save({
    name: 'InLine',
    key: LearningWayKey.INLINE,
  });

  const course = await courseRepository.save({
    category,
    availableLanguage: CourseLanguage.ALL,
    status: CourseStatus.Published,
    isPublic: true,
    isActive: true,
  });

  course.courseOutline = await Promise.all(
    percentageArray.map((_, index) =>
      courseOutlineRepository.save({
        course: { id: course.id },
        category: subCategory,
        learningWay,
        part: index + 1,
      }),
    ),
  );

  return course;
}

export async function getF2FCourse(
  app: TestingModule,
  percentageArray: number[],
) {
  const entityManager = app.get(EntityManager);
  const courseRepository = entityManager.getRepository(Course);
  const courseOutlineRepository = entityManager.getRepository(CourseOutline);
  const courseCategoryRepository = entityManager.getRepository(CourseCategory);
  const courseSubCategoryRepository =
    entityManager.getRepository(CourseSubCategory);
  const learningWayRepository = entityManager.getRepository(LearningWay);

  const category = await courseCategoryRepository.save({
    name: 'Learning Event',
    key: CourseCategoryKey.LEARNING_EVENT,
  });

  const subCategory = await courseSubCategoryRepository.save({
    name: 'Face to Face',
    key: CourseSubCategoryKey.FACE_TO_FACE,
    courseCategory: category,
  });

  const learningWay = await learningWayRepository.save({
    name: 'InLine',
    key: LearningWayKey.INLINE,
  });

  const course = await courseRepository.save({
    category,
    availableLanguage: CourseLanguage.ALL,
    status: CourseStatus.Published,
    isPublic: true,
    isActive: true,
  });

  course.courseOutline = await Promise.all(
    percentageArray.map((_, index) =>
      courseOutlineRepository.save({
        course: { id: course.id },
        category: subCategory,
        learningWay,
        part: index + 1,
      }),
    ),
  );

  return course;
}

export async function getSamePartOutlinesCourse(
  app: TestingModule,
  percentageArrayVirtual: number[],
  percentageArrayF2F: number[],
) {
  const entityManager = app.get(EntityManager);
  const courseRepository = entityManager.getRepository(Course);
  const courseOutlineRepository = entityManager.getRepository(CourseOutline);
  const courseCategoryRepository = entityManager.getRepository(CourseCategory);
  const courseSubCategoryRepository =
    entityManager.getRepository(CourseSubCategory);
  const learningWayRepository = entityManager.getRepository(LearningWay);

  const category = await courseCategoryRepository.save({
    name: 'Learning Event',
    key: CourseCategoryKey.LEARNING_EVENT,
  });

  const subCategoryVirtual = await courseSubCategoryRepository.save({
    name: 'Virtual',
    key: CourseSubCategoryKey.VIRTUAL,
    courseCategory: category,
  });

  const subCategoryF2F = await courseSubCategoryRepository.save({
    name: 'Face to Face',
    key: CourseSubCategoryKey.FACE_TO_FACE,
    courseCategory: category,
  });

  const learningWay = await learningWayRepository.save({
    name: 'InLine',
    key: LearningWayKey.INLINE,
  });

  const course = await courseRepository.save({
    category,
    availableLanguage: CourseLanguage.ALL,
    status: CourseStatus.Published,
    isPublic: true,
    isActive: true,
  });

  const courseOutlineVirutal = await Promise.all(
    percentageArrayVirtual.map((_, index) =>
      courseOutlineRepository.save({
        course: { id: course.id },
        category: subCategoryVirtual,
        learningWay,
        part: index + 1,
      }),
    ),
  );

  const courseOutlineF2F = await Promise.all(
    percentageArrayF2F.map((_, index) =>
      courseOutlineRepository.save({
        course: { id: course.id },
        category: subCategoryF2F,
        learningWay,
        part: index + 1,
      }),
    ),
  );

  course.courseOutline = [...courseOutlineVirutal, ...courseOutlineF2F];

  return course;
}

export async function enrolledCourse(
  app: TestingModule,
  userId: string,
  courseId: string,
) {
  await app
    .get(EntityManager)
    .getRepository(UserEnrolledCourse)
    .save({
      user: { id: userId },
      course: { id: courseId },
      status: UserEnrolledCourseStatus.ENROLLED,
      percentage: 0,
      isActive: true,
    });
}

export async function beginCourseOutline(
  app: TestingModule,
  userId: string,
  courseOutlineId: string,
  percentage: number,
) {
  let status = UserCourseOutlineProgressStatus.IN_PROGRESS;
  if (percentage === 100) {
    status = UserCourseOutlineProgressStatus.COMPLETED;
  } else if (percentage === 0) {
    status = UserCourseOutlineProgressStatus.ENROLLED;
  }

  return app
    .get(EntityManager)
    .getRepository(UserCourseOutlineProgress)
    .save({
      user: { id: userId },
      courseOutline: { id: courseOutlineId },
      percentage,
      status,
      isActive: true,
    });
}

export function getUserEnrolledCourse(
  app: TestingModule,
  userId: string,
  courseId: string,
) {
  return app
    .get(EntityManager)
    .getRepository(UserEnrolledCourse)
    .findOneOrFail({
      user: { id: userId },
      course: { id: courseId },
    });
}

export function createRandomCertificate(
  app: TestingModule,
  uploaderId: string,
) {
  return app
    .get(EntityManager)
    .getRepository(Certificate)
    .save({
      orientation: CertificationOrientation.HORIZONTAL,
      certType: CertificationType.COURSE,
      title: 'Random Certificate',
      mime: 'application/pdf',
      filename: 'random_certificate.pdf',
      key: 'random_certificate.pdf',
      bytes: 100,
      hash: '99999999999',
      provider: 'SEAC',
      uploader: { id: uploaderId },
    });
}

export async function createCertificateUnlockRule(
  app: TestingModule,
  userId: string,
  certificateId: string,
  courseIds: string[],
  requiredPercentage?: number[],
) {
  const entityManager = app.get(EntityManager);
  const certificateUnlockRuleRepository = entityManager.getRepository(
    CertificateUnlockRule,
  );
  const certificateUnlockRuleCourseItemRepository = entityManager.getRepository(
    CertificateUnlockRuleCourseItem,
  );
  return certificateUnlockRuleRepository.save({
    certificate: { id: certificateId },
    ruleName: 'Random Certificate Rule',
    unlockType: CertificationType.COURSE,
    createdBy: { id: userId },
    lastModifiedBy: { id: userId },
    isActive: true,
    courseRuleItems: courseIds.map((courseId, index) =>
      certificateUnlockRuleCourseItemRepository.create({
        course: { id: courseId },
        percentage:
          requiredPercentage && requiredPercentage.length > index
            ? requiredPercentage[index]
            : 100,
        isActive: true,
      }),
    ),
  });
}

export function getUserCertificate(
  app: TestingModule,
  userId: string,
  certificateId: string,
) {
  return app
    .get(EntityManager)
    .getRepository(UserCertificate)
    .findOne({
      user: { id: userId },
      certificate: { id: certificateId },
      isActive: true,
    });
}
