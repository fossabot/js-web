import { MutableRefObject } from 'react';
import { CourseAssignmentStatus } from '../dashboard/components/CourseAssignmentStatus';
import useTranslation from '../i18n/useTranslation';
import {
  CourseCategoryKey,
  CourseSubCategoryKey,
  ICourseDetail,
} from '../models/course';
import Button from '../ui-kit/Button';
import Picture from '../ui-kit/Picture';
import Breadcrumb from './Breadcrumb';
import {
  IEnrolledStatus,
  ValidateCourseOutlineParams,
} from './CourseDetailPage';
import CourseMainCTA from './CourseMainCTA';
import CourseProgressIndicator from './CourseProgressRing';
import { useCourseMainCTA } from './useCourseMainCTA';

export default function CourseDetailHeader({
  courseDetail,
  enrolledStatus,
  onEnroll,
  outlineRef,
  onValidateCourseOutline,
}: {
  courseDetail: ICourseDetail;
  enrolledStatus: IEnrolledStatus;
  onEnroll: () => Promise<void>;
  outlineRef: MutableRefObject<any>;
  onValidateCourseOutline: (
    params: ValidateCourseOutlineParams,
  ) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const { currentCourseOutline, handleCTA, loading } =
    useCourseMainCTA(courseDetail);

  const courseOutlineFirstCategoryKey =
    courseDetail.courseOutlines[0].category.key;

  const overallCourseProgress = courseDetail.userEnrolledCourse.length
    ? courseDetail.userEnrolledCourse[0].percentage
    : 0;

  function getHeaderText() {
    if (courseDetail.category.key === CourseCategoryKey.ASSESSMENT) {
      if (courseDetail.courseOutlines[0].assessmentUserCanRetest) {
        return (
          <div className="p-3 text-caption text-gray-650">
            {t('courseDetailPage.previousResult')}
            <span className="ml-1 font-semibold">
              {t('courseDetailPage.overridden')}
            </span>
          </div>
        );
      }
      return (
        <div className="p-3 text-caption text-gray-650">
          {t('courseDetailPage.assessmentTaken')}
          <span className="ml-1 font-semibold">
            {t('courseDetailPage.once')}
          </span>
        </div>
      );
    }
    if (currentCourseOutline) {
      return (
        <div className="text-right text-caption font-normal text-gray-500 line-clamp-1">
          {currentCourseOutline.text}
        </div>
      );
    }
  }

  return (
    <div className="mx-6 flex flex-col border-b border-gray-200 pb-8 lg:mx-0 lg:flex-row lg:border-none lg:pb-0">
      <div className="relative mr-4 mb-6 h-248px w-248px flex-none lg:mb-0 lg:block lg:h-55 lg:w-55">
        {!courseDetail.imageKey ? (
          <Picture
            className="rounded-2xl object-cover"
            sources={[
              {
                srcSet: '/assets/course/course-default.webp',
                type: 'image/webp',
              },
            ]}
            fallbackImage={{ src: '/assets/course/course-default.png' }}
          />
        ) : (
          <img
            className="rounded-2xl object-cover"
            alt={courseDetail.title}
            src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${courseDetail.imageKey}`}
          />
        )}
        <>
          {courseDetail.courseOutlines.find(
            (co) => co.category?.key === CourseSubCategoryKey.LINK,
          ) ? (
            <div className="absolute bottom-0 right-0 rounded-tl-lg rounded-br-xl bg-maroon-100 px-4 py-2 text-sm font-semibold text-brand-primary">
              <div className="line-clamp-1">
                {courseDetail.courseOutlines[0].providerName}
              </div>
            </div>
          ) : null}
        </>
      </div>
      <div className="ml-0 flex h-full w-full flex-col justify-between lg:ml-4 lg:h-55">
        <div className="pb-6 lg:pb-4">
          <div className="mb-3 flex items-center space-x-2">
            <Breadcrumb courseDetail={courseDetail} />
            {courseDetail.userAssignedCourse?.[0] && (
              <CourseAssignmentStatus
                type={courseDetail.userAssignedCourse?.[0]?.assignmentType}
              />
            )}
          </div>
          <h2 className="text-subtitle font-bold line-clamp-none lg:line-clamp-2">
            {courseDetail.title}
          </h2>
          {courseDetail.tagLine ? (
            <div className="mt-2 text-body text-gray-650 line-clamp-none lg:line-clamp-2">
              {courseDetail.tagLine}
            </div>
          ) : null}
        </div>
        <div className="mt-0 lg:mt-3.5">
          {enrolledStatus?.success ? (
            <div className="hidden w-full rounded-2xl border border-gray-200 bg-gray-100 p-2 lg:flex">
              <div className="ml-2 flex w-1/4 items-center text-body font-semibold">
                <CourseProgressIndicator
                  ringClassName="mr-2 w-6 h-6"
                  overallCourseProgress={overallCourseProgress}
                />
              </div>
              {(courseOutlineFirstCategoryKey === CourseSubCategoryKey.SCORM ||
                courseOutlineFirstCategoryKey ===
                  CourseSubCategoryKey.DOCUMENT) &&
              overallCourseProgress >= 100 ? null : (
                <div className="flex w-3/4 items-center justify-end">
                  {getHeaderText()}
                  <div className="ml-4">
                    <CourseMainCTA
                      avoidFullWidth
                      courseDetail={courseDetail}
                      overallCourseProgress={overallCourseProgress}
                      onCTA={() =>
                        handleCTA(onValidateCourseOutline, outlineRef)
                      }
                      loading={loading}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              avoidFullWidth
              className="font-semibold"
              size="medium"
              variant="primary"
              type="button"
              onClick={onEnroll}
            >
              {t('courseDetailPage.enrollNow')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
