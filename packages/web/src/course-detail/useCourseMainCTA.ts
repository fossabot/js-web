import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';
import { MutableRefObject, useState } from 'react';
import WEB_PATHS from '../constants/webPaths';
import CourseApi from '../http/course.api';
import {
  CourseCategoryKey,
  CourseSubCategoryKey,
  ICourseDetail,
} from '../models/course';
import { ValidateCourseOutlineParams } from './CourseDetailPage';
import { getCurrentCourseOutline } from './helper';
import { useCourseAssessment } from './useCourseAssessment';

export function useCourseMainCTA(courseDetail: ICourseDetail<string>) {
  const router = useRouter();
  const currentCourseOutline = getCurrentCourseOutline(
    courseDetail.courseOutlines,
  );
  const { takeAssessment } = useCourseAssessment(courseDetail);
  const [loading, setLoading] = useState<boolean>(false);

  async function redirectToVideoPlayer() {
    // Get first video
    const lastSeenVideo = await CourseApi.getLastSeenVideo(courseDetail?.id);
    if (lastSeenVideo) {
      const videoId = lastSeenVideo.id;
      const learningWayId = router.query.learningWayId as string;
      const topicId = router.query.topicId as string;
      const url = WEB_PATHS.COURSE_VIDEO_PLAYER.replace(
        ':id',
        courseDetail.id,
      ).replace(':videoId', videoId);
      router.push(
        stringifyUrl({
          url,
          query: {
            topicId,
            learningWayId,
          },
        }),
      );
    } else {
      console.error('Not found any video');
    }
  }

  async function handleCTA(
    onValidateCourseOutline: (
      params: ValidateCourseOutlineParams,
    ) => Promise<boolean>,
    outlineRef: MutableRefObject<any>,
  ) {
    setLoading(true);
    const allowed = await onValidateCourseOutline(
      currentCourseOutline
        ? {
            type: 'VALIDATE_OUTLINE',
            outlineId: currentCourseOutline.id,
          }
        : {
            type: 'VALIDATE_COURSE',
            courseId: courseDetail.id,
          },
    );
    if (!allowed) {
      setLoading(false);
      return;
    }

    if (
      courseDetail.category.key === CourseCategoryKey.ONLINE_LEARNING &&
      courseDetail.courseOutlines.some(
        (co) => co.category.key === CourseSubCategoryKey.VIDEO,
      )
    ) {
      await redirectToVideoPlayer();
    } else if (courseDetail.category.key === CourseCategoryKey.ASSESSMENT) {
      await takeAssessment();
    } else if (
      !currentCourseOutline?.id ||
      courseDetail.courseOutlines[0].category.key === CourseSubCategoryKey.LINK
    ) {
      // TODO: Validate the link.
      window.location.href =
        courseDetail.courseOutlines[0].thirdPartyPlatformUrl;
      setLoading(false);
      return;
    } else {
      outlineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
    setLoading(false);
  }

  return {
    handleCTA,
    currentCourseOutline,
    loading,
  };
}
