import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import WEB_PATHS from '../../constants/webPaths';
import Breadcrumb from '../../course-detail/Breadcrumb';
import { ValidateCourseOutlineParams } from '../../course-detail/CourseDetailPage';
import { getDurationText } from '../../course-detail/getDurationText';
import { CourseAssignmentStatus } from '../../dashboard/components/CourseAssignmentStatus';
import useTranslation from '../../i18n/useTranslation';
import { ICourseDetail } from '../../models/course';
import {
  ClockGray,
  FileDownload,
  Info,
  LessonGray,
  OnlineLearningVideo,
} from '../../ui-kit/icons';
import PlanUpgradeModal, {
  usePlanUpgradeModal,
} from '../../ui-kit/PlanUpgradeModal';
import CourseDetailBadge from './CourseDetailBadge';
import MaterialItem from './MaterialItem';

interface ICourseDetailProps {
  course: ICourseDetail<string>;
  isEnrolled: boolean;
  lessonLength: number;
}

function CourseDetail({
  course,
  lessonLength,
  isEnrolled,
}: ICourseDetailProps) {
  const planUpgradeModalProps = usePlanUpgradeModal();
  const { t } = useTranslation();

  const durationText = useMemo(() => {
    return !!course ? getDurationText(course, t) : '';
  }, [course]);

  const onValidateCourseOutline = useCallback(
    async (params: ValidateCourseOutlineParams) => {
      if (params.type === 'DONT_VALIDATE') {
        planUpgradeModalProps.setCheapestPlan(params.plan);
        planUpgradeModalProps.setCanUpgrade(params.canUpgrade);
        planUpgradeModalProps.toggle();
        return false;
      }
      return true;
    },
    [],
  );

  return (
    <>
      <div className="mb-2.5 bg-white p-8 pt-6">
        <div className="lg:mx-auto lg:w-179">
          <div className="mb-3 flex items-center space-x-2">
            <Breadcrumb courseDetail={course} />
            {course.userAssignedCourse?.[0] && (
              <CourseAssignmentStatus
                type={course.userAssignedCourse?.[0]?.assignmentType}
              />
            )}
          </div>
          <Link href={WEB_PATHS.COURSE_DETAIL.replace(':id', course?.id)}>
            <a className="mb-4 block text-subheading font-bold">
              {course?.title}
            </a>
          </Link>
          <div className="text-caption">{course?.tagLine}</div>

          <hr className="my-8 border-t border-gray-200" />

          <h2 className="mb-6 flex items-center text-subheading font-bold">
            <Info className="mr-2" /> {t('courseDetailPage.about')}
          </h2>

          <div className="mb-3 flex flex-wrap items-center">
            <CourseDetailBadge
              text={t('courseVideoPlayerPage.onlineLearning')}
              icon={<OnlineLearningVideo className="w-3.5" />}
            />
            <CourseDetailBadge
              text={durationText}
              icon={<ClockGray className="w-3.5" />}
            />
            <CourseDetailBadge
              text={t('courseVideoPlayerPage.lessons', {
                number: lessonLength,
              })}
              icon={<LessonGray className="w-3.5" />}
            />
          </div>

          <h3 className="mb-4 text-body font-semibold">
            {t('courseDetailPage.description')}
          </h3>
          <div
            className="mb-6 pl-4 text-caption"
            dangerouslySetInnerHTML={{ __html: course?.description }}
          />

          <h3 className="mb-4 text-body font-semibold">
            {t('courseDetailPage.whatYouWillLearn')}
          </h3>
          <div
            className="mb-6 pl-4 text-caption"
            dangerouslySetInnerHTML={{
              __html: course?.learningObjective,
            }}
          />

          <hr className="my-8 border-t border-gray-200" />

          <h2 className="mb-6 flex items-center text-subheading font-bold">
            <FileDownload className="mr-2" />
            {t('courseDetailPage.material')}
          </h2>

          {course?.materials?.length > 0 && (
            <div>
              {course?.materials.map((material, index) => (
                <MaterialItem
                  key={index}
                  courseId={course.id}
                  material={material}
                  isEnrolled={isEnrolled}
                  onValidateCourseOutline={onValidateCourseOutline}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <PlanUpgradeModal {...planUpgradeModalProps} />
    </>
  );
}

export default CourseDetail;
