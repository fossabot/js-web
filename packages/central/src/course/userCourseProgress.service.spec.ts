import { TestingModule } from '@nestjs/testing';
import { getAveragePercentage } from '@seaccentral/core/dist/utils/math';
import { setupApp, teardownApp } from '../utils/testHelpers/setup-integration';
import {
  beginCourseOutline,
  createCertificateUnlockRule,
  createRandomCertificate,
  createUser,
  enrolledCourse,
  getF2FCourse,
  getOnlineLearningCourse,
  getSamePartOutlinesCourse,
  getUserCertificate,
  getUserEnrolledCourse,
  getVirtualCourse,
} from './test-utils/course-setup';
import { UserCourseProgressService } from './userCourseProgress.service';

describe('userCourseProgress.service.ts', () => {
  let app: TestingModule;

  beforeEach(async () => {
    app = await setupApp();
  });

  afterEach(async () => {
    await teardownApp(app);
  });

  describe('recalculateByCourseOutline', () => {
    it('should calculate entire course progress for non learning event course.', async () => {
      const percentageArray = [47, 59, 65, 98, 20];
      const expectedPercentage = getAveragePercentage(percentageArray);

      const course = await getOnlineLearningCourse(app, percentageArray);
      const user = await createUser(app);

      // Enroll course and begin the outline progress.
      await enrolledCourse(app, user.id, course.id);
      await Promise.all(
        percentageArray.map((percent, index) =>
          beginCourseOutline(
            app,
            user.id,
            course.courseOutline[index].id,
            percent,
          ),
        ),
      );

      // Recalculate entire course progress.
      await app
        .get(UserCourseProgressService)
        .recalculateByCourseOutline(user, course.courseOutline[0].id);

      const userEnrolledCourse = await getUserEnrolledCourse(
        app,
        user.id,
        course.id,
      );
      expect(userEnrolledCourse.percentage).toEqual(expectedPercentage);
    });

    it('should calculate entire course progress even not have all course outline progress.', async () => {
      const percentageArray = [47, 59, 65, 0, 0];
      const expectedPercentage = getAveragePercentage(percentageArray);

      const course = await getOnlineLearningCourse(app, percentageArray);
      const user = await createUser(app);

      // Enroll course and begin the outline progress.
      await enrolledCourse(app, user.id, course.id);
      await Promise.all(
        Array.from({ length: 3 }).map((_, index) =>
          beginCourseOutline(
            app,
            user.id,
            course.courseOutline[index].id,
            percentageArray[index],
          ),
        ),
      );

      // Recalculate entire course progress.
      await app
        .get(UserCourseProgressService)
        .recalculateByCourseOutline(user, course.courseOutline[0].id);

      const userEnrolledCourse = await getUserEnrolledCourse(
        app,
        user.id,
        course.id,
      );
      expect(userEnrolledCourse.percentage).toEqual(expectedPercentage);
    });

    it('should be able to calculate if have virtual course outline only.', async () => {
      const percentageArray = [27, 100, 98, 57, 26];
      const expectedPercentage = getAveragePercentage(percentageArray);

      const course = await getVirtualCourse(app, percentageArray);
      const user = await createUser(app);

      // Enroll course and begin the outline progress.
      await enrolledCourse(app, user.id, course.id);
      await Promise.all(
        percentageArray.map((percent, index) =>
          beginCourseOutline(
            app,
            user.id,
            course.courseOutline[index].id,
            percent,
          ),
        ),
      );

      // Recalculate entire course progress.
      await app
        .get(UserCourseProgressService)
        .recalculateByCourseOutline(user, course.courseOutline[0].id);

      const userEnrolledCourse = await getUserEnrolledCourse(
        app,
        user.id,
        course.id,
      );
      expect(userEnrolledCourse.percentage).toEqual(expectedPercentage);
    });

    it('should be able to calculate if have F2F course outline only.', async () => {
      const percentageArray = [87, 34, 55, 99, 100];
      const expectedPercentage = getAveragePercentage(percentageArray);

      const course = await getF2FCourse(app, percentageArray);
      const user = await createUser(app);

      // Enroll course and begin the outline progress.
      await enrolledCourse(app, user.id, course.id);
      await Promise.all(
        percentageArray.map((percent, index) =>
          beginCourseOutline(
            app,
            user.id,
            course.courseOutline[index].id,
            percent,
          ),
        ),
      );

      // Recalculate entire course progress.
      await app
        .get(UserCourseProgressService)
        .recalculateByCourseOutline(user, course.courseOutline[0].id);

      const userEnrolledCourse = await getUserEnrolledCourse(
        app,
        user.id,
        course.id,
      );
      expect(userEnrolledCourse.percentage).toEqual(expectedPercentage);
    });

    it('should use most progress for both same-part outline course (F2F & Virtual)', async () => {
      const percentageArrayVirtual = [73, 55, 25, 97, 98];
      const percentageArrayF2F = [80, 70, 90, 100, 87];
      const expectedPercentage = getAveragePercentage(percentageArrayF2F);

      const course = await getSamePartOutlinesCourse(
        app,
        percentageArrayVirtual,
        percentageArrayF2F,
      );
      const user = await createUser(app);

      // Enroll course and begin the outline progress.
      await enrolledCourse(app, user.id, course.id);
      await Promise.all([
        ...percentageArrayVirtual.map((percent, index) =>
          beginCourseOutline(
            app,
            user.id,
            course.courseOutline[index].id,
            percent,
          ),
        ),
        ...percentageArrayF2F.map((percent, index) =>
          beginCourseOutline(
            app,
            user.id,
            course.courseOutline[index + percentageArrayVirtual.length].id,
            percent,
          ),
        ),
      ]);

      // Recalculate entire course progress.
      await app
        .get(UserCourseProgressService)
        .recalculateByCourseOutline(user, course.courseOutline[0].id);

      const userEnrolledCourse = await getUserEnrolledCourse(
        app,
        user.id,
        course.id,
      );
      expect(userEnrolledCourse.percentage).toEqual(expectedPercentage);
    });
  });

  describe('recalculateByCourse', () => {
    it('should calculate entire course progress for non learning event course.', async () => {
      const percentageArray = [47, 59, 65, 98, 20];
      const expectedPercentage = getAveragePercentage(percentageArray);

      const course = await getOnlineLearningCourse(app, percentageArray);
      const user = await createUser(app);

      // Enroll course and begin the outline progress.
      await enrolledCourse(app, user.id, course.id);
      await Promise.all(
        percentageArray.map((percent, index) =>
          beginCourseOutline(
            app,
            user.id,
            course.courseOutline[index].id,
            percent,
          ),
        ),
      );

      // Recalculate entire course progress.
      await app
        .get(UserCourseProgressService)
        .recalculateByCourse(user, course.id);

      const userEnrolledCourse = await getUserEnrolledCourse(
        app,
        user.id,
        course.id,
      );
      expect(userEnrolledCourse.percentage).toEqual(expectedPercentage);
    });

    it('should calculate entire course progress even not have all course outline progress.', async () => {
      const percentageArray = [47, 59, 65, 0, 0];
      const expectedPercentage = getAveragePercentage(percentageArray);

      const course = await getOnlineLearningCourse(app, percentageArray);
      const user = await createUser(app);

      // Enroll course and begin the outline progress.
      await enrolledCourse(app, user.id, course.id);
      await Promise.all(
        Array.from({ length: 3 }).map((_, index) =>
          beginCourseOutline(
            app,
            user.id,
            course.courseOutline[index].id,
            percentageArray[index],
          ),
        ),
      );

      // Recalculate entire course progress.
      await app
        .get(UserCourseProgressService)
        .recalculateByCourse(user, course.id);

      const userEnrolledCourse = await getUserEnrolledCourse(
        app,
        user.id,
        course.id,
      );
      expect(userEnrolledCourse.percentage).toEqual(expectedPercentage);
    });

    it('should be able to calculate if have virtual course outline only.', async () => {
      const percentageArray = [27, 100, 98, 57, 26];
      const expectedPercentage = getAveragePercentage(percentageArray);

      const course = await getVirtualCourse(app, percentageArray);
      const user = await createUser(app);

      // Enroll course and begin the outline progress.
      await enrolledCourse(app, user.id, course.id);
      await Promise.all(
        percentageArray.map((percent, index) =>
          beginCourseOutline(
            app,
            user.id,
            course.courseOutline[index].id,
            percent,
          ),
        ),
      );

      // Recalculate entire course progress.
      await app
        .get(UserCourseProgressService)
        .recalculateByCourse(user, course.id);

      const userEnrolledCourse = await getUserEnrolledCourse(
        app,
        user.id,
        course.id,
      );
      expect(userEnrolledCourse.percentage).toEqual(expectedPercentage);
    });

    it('should be able to calculate if have F2F course outline only.', async () => {
      const percentageArray = [87, 34, 55, 99, 100];
      const expectedPercentage = getAveragePercentage(percentageArray);

      const course = await getF2FCourse(app, percentageArray);
      const user = await createUser(app);

      // Enroll course and begin the outline progress.
      await enrolledCourse(app, user.id, course.id);
      await Promise.all(
        percentageArray.map((percent, index) =>
          beginCourseOutline(
            app,
            user.id,
            course.courseOutline[index].id,
            percent,
          ),
        ),
      );

      // Recalculate entire course progress.
      await app
        .get(UserCourseProgressService)
        .recalculateByCourse(user, course.id);

      const userEnrolledCourse = await getUserEnrolledCourse(
        app,
        user.id,
        course.id,
      );
      expect(userEnrolledCourse.percentage).toEqual(expectedPercentage);
    });

    it('should use most progress for both same-part outline course (F2F & Virtual)', async () => {
      const percentageArrayVirtual = [73, 55, 25, 97, 98];
      const percentageArrayF2F = [80, 70, 90, 100, 87];
      const expectedPercentage = getAveragePercentage(percentageArrayF2F);

      const course = await getSamePartOutlinesCourse(
        app,
        percentageArrayVirtual,
        percentageArrayF2F,
      );
      const user = await createUser(app);

      // Enroll course and begin the outline progress.
      await enrolledCourse(app, user.id, course.id);
      await Promise.all([
        ...percentageArrayVirtual.map((percent, index) =>
          beginCourseOutline(
            app,
            user.id,
            course.courseOutline[index].id,
            percent,
          ),
        ),
        ...percentageArrayF2F.map((percent, index) =>
          beginCourseOutline(
            app,
            user.id,
            course.courseOutline[index + percentageArrayVirtual.length].id,
            percent,
          ),
        ),
      ]);

      // Recalculate entire course progress.
      await app
        .get(UserCourseProgressService)
        .recalculateByCourse(user, course.id);

      const userEnrolledCourse = await getUserEnrolledCourse(
        app,
        user.id,
        course.id,
      );
      expect(userEnrolledCourse.percentage).toEqual(expectedPercentage);
    });
  });

  describe('Unlock Certificate', () => {
    it('should unlock certificate for user after finish the course', async () => {
      const percentageArray = [100, 100, 100, 100, 100];

      const course1 = await getOnlineLearningCourse(app, percentageArray);
      const course2 = await getF2FCourse(app, percentageArray);
      const user = await createUser(app);
      const certificate = await createRandomCertificate(app, user.id);
      await createCertificateUnlockRule(app, user.id, certificate.id, [
        course1.id,
        course2.id,
      ]);

      // Enroll course and begin the outline progress.
      await enrolledCourse(app, user.id, course1.id);
      await enrolledCourse(app, user.id, course2.id);
      await Promise.all(
        percentageArray.map((percent, index) =>
          beginCourseOutline(
            app,
            user.id,
            course1.courseOutline[index].id,
            percent,
          ),
        ),
      );
      await Promise.all(
        percentageArray.map((percent, index) =>
          beginCourseOutline(
            app,
            user.id,
            course2.courseOutline[index].id,
            percent,
          ),
        ),
      );

      // Recalculate entire course progress.
      await app
        .get(UserCourseProgressService)
        .recalculateByCourseOutline(user, course1.courseOutline[0].id);
      await app
        .get(UserCourseProgressService)
        .recalculateByCourseOutline(user, course2.courseOutline[0].id);

      const userCertificate = await getUserCertificate(
        app,
        user.id,
        certificate.id,
      );
      expect(userCertificate?.certificate?.id).toBe(certificate.id);
      expect(userCertificate?.user?.id).toBe(user.id);
    });

    it('should unlock certificate with minimum percentage', async () => {
      const percentageArray = [90, 90, 90, 90, 90];

      const course1 = await getOnlineLearningCourse(app, percentageArray);
      const course2 = await getF2FCourse(app, percentageArray);
      const user = await createUser(app);
      const certificate = await createRandomCertificate(app, user.id);
      await createCertificateUnlockRule(
        app,
        user.id,
        certificate.id,
        [course1.id, course2.id],
        [80, 85],
      );

      // Enroll course and begin the outline progress.
      await enrolledCourse(app, user.id, course1.id);
      await enrolledCourse(app, user.id, course2.id);
      await Promise.all(
        percentageArray.map((percent, index) =>
          beginCourseOutline(
            app,
            user.id,
            course1.courseOutline[index].id,
            percent,
          ),
        ),
      );
      await Promise.all(
        percentageArray.map((percent, index) =>
          beginCourseOutline(
            app,
            user.id,
            course2.courseOutline[index].id,
            percent,
          ),
        ),
      );

      // Recalculate entire course progress.
      await app
        .get(UserCourseProgressService)
        .recalculateByCourseOutline(user, course1.courseOutline[0].id);
      await app
        .get(UserCourseProgressService)
        .recalculateByCourseOutline(user, course2.courseOutline[0].id);

      const userCertificate = await getUserCertificate(
        app,
        user.id,
        certificate.id,
      );
      expect(userCertificate?.certificate?.id).toBe(certificate.id);
      expect(userCertificate?.user?.id).toBe(user.id);
    });
  });
});
