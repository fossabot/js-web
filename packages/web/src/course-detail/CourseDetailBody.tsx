import cx from 'classnames';
import React, {
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useResponsive } from '../hooks/useResponsive';
import useTranslation from '../i18n/useTranslation';
import { MaterialExternal, MaterialInternal } from '../models/baseMaterial';
import {
  CourseCategoryKey,
  CourseSubCategoryKey,
  ICourseDetail,
  ICourseOutlineDetail,
} from '../models/course';
import { ExternalAssessment } from '../models/externalAssessment';
import { MediaExtended } from '../models/media';
import Button from '../ui-kit/Button';
import {
  BurgerMenu,
  Certificate,
  ClockGray,
  CloudDownload,
  FileDownload,
  Info,
  LessonGray,
  OnlineLearningVideo,
  Report,
} from '../ui-kit/icons';
import CourseDetailMarkdownWithTitle from './CourseDetailMarkdownWithTitle';
import {
  IEnrolledStatus,
  ValidateCourseOutlineParams,
} from './CourseDetailPage';
import CourseMainCTA from './CourseMainCTA';
import { CourseOutline } from './CourseOutline';
import CourseProgressIndicator from './CourseProgressRing';
import CourseVideoPlaylist from './CourseVideoPlaylist';
import { getDurationText } from './getDurationText';
import MaterialItem from './MaterialItem';
import MobileFloatingIndicator from './MobileFloatingIndicator';
import { useCourseAssessment } from './useCourseAssessment';
import { useCourseMainCTA } from './useCourseMainCTA';
import { first } from 'lodash';

export default function CourseDetailBody({
  courseDetail,
  enrolledStatus,
  onEnroll,
  outlineRef,
  onValidateCourseOutline,
  videos,
  hasCertificate,
}: {
  onEnroll: () => Promise<void>;
  courseDetail: ICourseDetail;
  enrolledStatus: IEnrolledStatus;
  outlineRef: MutableRefObject<any>;
  onValidateCourseOutline: (
    params: ValidateCourseOutlineParams,
  ) => Promise<boolean>;
  videos: MediaExtended[];
  hasCertificate: boolean;
}) {
  const contentRef = useRef(null);
  const materialsRef = useRef(null);
  const reportRef = useRef(null);
  const [showFloatingTitle, setShowFloatingTitle] = useState(false);
  const [isShortDescription, setIsShortDescription] = useState(false);
  const { t } = useTranslation();
  const { currentCourseOutline, handleCTA, loading } =
    useCourseMainCTA(courseDetail);
  const { isAssessmentCourse, isRetestable, fetchAssessment } =
    useCourseAssessment(courseDetail);
  const [externalAssessment, setExternalAssessment] =
    useState<ExternalAssessment>(null);
  const { lg } = useResponsive();

  const courseOutlineFirst: ICourseOutlineDetail | undefined = first(
    courseDetail.courseOutlines,
  );
  const courseOutlineFirstCategoryKey = courseOutlineFirst?.category.key;

  useEffect(() => {
    const onScroll = () => {
      const header = document.querySelector(`[data-id="main-navbar"]`);

      if (isShortDescription) setShowFloatingTitle(true);
      else if (contentRef.current) {
        setShowFloatingTitle(
          contentRef.current?.getBoundingClientRect().top <=
            header.getBoundingClientRect().height,
        );
      }
    };

    if (isShortDescription) setShowFloatingTitle(true);

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  useEffect(() => {
    if (isAssessmentCourse() && courseOutlineFirst) {
      fetchAssessment(courseOutlineFirst.id).then((assessment) =>
        setExternalAssessment(assessment),
      );
    }
  }, [courseDetail.category]);
  useEffect(() => {
    if (lg) setShowFloatingTitle(false);
  }, [lg]);

  useEffect(() => {
    if (
      !lg &&
      window.screen.availHeight >=
        contentRef.current?.getBoundingClientRect().height
    )
      setIsShortDescription(true);
  }, [lg, contentRef?.current]);
  const overallCourseProgress = courseDetail.userEnrolledCourse.length
    ? courseDetail.userEnrolledCourse[0].percentage
    : 0;

  const executeScroll = (ref) =>
    ref.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });

  const showOutline =
    courseDetail.courseOutlines.length > 0 &&
    courseOutlineFirstCategoryKey !== CourseSubCategoryKey.LINK &&
    courseDetail.category.key !== CourseCategoryKey.MATERIAL &&
    courseDetail.category.key !== CourseCategoryKey.ASSESSMENT;

  const isVideoCourse = useMemo(
    () =>
      courseDetail?.courseOutlines.some(
        (co) => co.category.key === CourseSubCategoryKey.VIDEO,
      ),
    [courseDetail?.courseOutlines],
  );

  function getAssessmentHeaderText() {
    if (isRetestable()) {
      return (
        <div className="text-footnote font-regular text-gray-650">
          {t('courseDetailPage.previousResult')}{' '}
          <span className="font-semibold">
            {t('courseDetailPage.overridden')}
          </span>
        </div>
      );
    }
    return (
      <div className="text-footnote font-regular text-gray-650">
        {t('courseDetailPage.assessmentTaken')}{' '}
        <span className="font-semibold">{t('courseDetailPage.once')}</span>
      </div>
    );
  }

  function getHeaderText() {
    if (isAssessmentCourse()) {
      return getAssessmentHeaderText();
    }
    if (currentCourseOutline) {
      return (
        <div className="text-caption font-normal text-gray-500 line-clamp-1">
          {currentCourseOutline.text}
        </div>
      );
    }
  }

  return (
    <div className="relative mx-6 flex flex-col py-8 lg:mx-0 lg:flex-row lg:space-x-4 lg:py-12">
      <div className="sticky top-20 hidden flex-col self-start lg:flex">
        <aside className="w-55 rounded-2xl border border-gray-200">
          <div
            onClick={() => executeScroll(contentRef)}
            className="group flex cursor-pointer items-center space-x-3 p-4"
          >
            <Info className="h-5 w-5 text-gray-400 group-hover:text-brand-primary" />
            <span className="text-caption font-semibold text-gray-650 group-hover:text-brand-primary">
              {t('courseDetailPage.about')}
            </span>
          </div>
          {courseDetail.materials?.length > 0 && (
            <div
              onClick={() => executeScroll(materialsRef)}
              className="group flex cursor-pointer items-center space-x-3 p-4"
            >
              <FileDownload className="h-5 w-5 text-gray-400 group-hover:text-brand-primary" />
              <span className="text-caption font-semibold text-gray-650 group-hover:text-brand-primary">
                {t('courseDetailPage.material')}
              </span>
            </div>
          )}
          {isAssessmentCourse() && (
            <div
              onClick={() => executeScroll(reportRef)}
              className="group flex cursor-pointer items-center space-x-3 p-4"
            >
              <Report className="h-5 w-5 text-gray-400 group-hover:text-brand-primary" />
              <span className="text-caption font-semibold text-gray-650 group-hover:text-brand-primary">
                {t('courseDetailPage.report')}
              </span>
            </div>
          )}
          {showOutline && (
            <div
              onClick={() => executeScroll(outlineRef)}
              className="group flex cursor-pointer items-center space-x-3 p-4"
            >
              <BurgerMenu className="h-5 w-5 text-gray-400 group-hover:text-brand-primary" />
              <span className="text-caption font-semibold text-gray-650 group-hover:text-brand-primary">
                {t(
                  isVideoCourse
                    ? 'courseDetailPage.playlist'
                    : 'courseDetailPage.outline',
                )}
              </span>
            </div>
          )}
        </aside>
        {showFloatingTitle && enrolledStatus?.success && (
          <div className="mt-4 flex w-55 flex-col items-start rounded-2xl border border-gray-200 p-4 text-caption font-semibold">
            <div className="w-full text-caption font-semibold">
              <div className="mb-4">{courseDetail.title}</div>
              <div className="mb-3 flex items-center">
                <CourseProgressIndicator
                  ringClassName="mr-1 w-5 h-5"
                  overallCourseProgress={overallCourseProgress}
                />
              </div>
            </div>
            {(courseOutlineFirstCategoryKey === CourseSubCategoryKey.SCORM ||
              courseOutlineFirstCategoryKey ===
                CourseSubCategoryKey.DOCUMENT) &&
            overallCourseProgress >= 100 ? null : (
              <div className="flex w-full flex-col border-t border-gray-200 pt-3">
                <div className="mb-2">{getHeaderText()}</div>
                <CourseMainCTA
                  courseDetail={courseDetail}
                  overallCourseProgress={overallCourseProgress}
                  onCTA={() => handleCTA(onValidateCourseOutline, outlineRef)}
                  loading={loading}
                />
              </div>
            )}
          </div>
        )}
        {showFloatingTitle && !enrolledStatus?.success && (
          <div className="mr-4 mt-4 flex w-55 flex-col items-start divide-y divide-gray-200 rounded-2xl border border-gray-200 p-4 text-caption font-semibold">
            <div className="mb-3 w-full text-caption font-semibold">
              {courseDetail.title}
            </div>
            <div className="w-full pt-3 text-caption font-semibold">
              <Button
                className="font-semibold"
                size="medium"
                variant="primary"
                type="button"
                onClick={onEnroll}
              >
                {t('courseDetailPage.enrollNow')}
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="ml-0 w-full lg:ml-4" ref={contentRef}>
        <div className="relative w-full pb-2">
          <h3 className="flex items-center text-heading font-semibold text-black">
            <Info className="mr-2 inline h-6 w-6" />
            {t('courseDetailPage.about')}
          </h3>
          <div className="my-6 flex flex-row flex-wrap gap-2">
            <span className="flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-caption font-semibold">
              <OnlineLearningVideo className="mr-2 h-4 w-4" />
              {courseDetail.category.name}
            </span>
            <span className="flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-caption font-semibold">
              <ClockGray className="mr-2 h-4 w-4" />
              <span>{getDurationText(courseDetail, t)}</span>
            </span>
            {isVideoCourse && (
              <span className="flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-caption font-semibold">
                <LessonGray className="mr-2 h-4 w-4" />
                {t('courseVideoPlayerPage.lessons', {
                  number: videos?.length,
                })}
              </span>
            )}
            {hasCertificate && (
              <span className="flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-caption font-semibold">
                <Certificate className="mr-2 h-4 w-4" />
                <span>{t('courseDetailPage.certificate')}</span>
              </span>
            )}
          </div>
          <CourseDetailMarkdownWithTitle
            title={t('courseDetailPage.description')}
            content={courseDetail.description}
          />
          <CourseDetailMarkdownWithTitle
            title={t('courseDetailPage.whoThisCourseIsFor')}
            content={courseDetail.courseTarget}
          />
          <CourseDetailMarkdownWithTitle
            title={t('courseDetailPage.whatYouWillLearn')}
            content={courseDetail.learningObjective}
          />
        </div>
        {courseDetail.materials.length > 0 ? (
          <div className="relative w-full border-t border-gray-200 py-2">
            <div ref={materialsRef} className="absolute -top-20"></div>
            <h3 className="mt-4 mb-6 flex items-center text-heading font-semibold text-black">
              <FileDownload className="mr-2 inline h-6 w-6" />
              {t('courseDetailPage.material')}
            </h3>
            {courseDetail.materials.map(
              (material: MaterialInternal | MaterialExternal) => (
                <MaterialItem
                  key={material.id}
                  material={material}
                  courseDetail={courseDetail}
                  enrolledStatus={enrolledStatus}
                  onValidateCourseOutline={onValidateCourseOutline}
                />
              ),
            )}
          </div>
        ) : null}
        {showOutline ? (
          <div className="relative w-full border-t border-gray-200 py-2">
            <div ref={outlineRef} className="absolute -top-20"></div>
            {isVideoCourse ? (
              <CourseVideoPlaylist
                courseDetail={courseDetail}
                videos={videos}
              />
            ) : (
              <CourseOutline
                courseDetail={courseDetail}
                enrolledStatus={enrolledStatus}
                onValidateCourseOutline={onValidateCourseOutline}
              />
            )}
          </div>
        ) : null}
        {isAssessmentCourse() && (
          <section ref={reportRef}>
            <div className="flex items-center space-x-2">
              <Report />
              <span className="text-heading font-semibold">
                {t('courseDetailPage.report')}
              </span>
            </div>
            {externalAssessment?.reportUrl ? (
              <a
                href={externalAssessment.reportUrl}
                target="_blank"
                rel="noreferrer"
              >
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-100 p-4">
                  <div className="flex items-center space-x-3">
                    <Report className="text-gray-300" />
                    <span className="line-clamp-1">{`Report: ${courseDetail.title}`}</span>
                  </div>
                  <Button
                    variant="secondary"
                    avoidFullWidth
                    className="hidden lg:block"
                  >
                    <div className="flex items-center space-x-2 py-1 px-3">
                      <CloudDownload />
                      <span>{t('courseDetailPage.download')}</span>
                    </div>
                  </Button>
                </div>
              </a>
            ) : (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-100 px-6 py-8 text-center">
                <div className="text-heading font-semibold">
                  {t('courseDetailPage.noReportAvailable')}
                </div>
                <div className="mt-2 text-gray-500">
                  {t('courseDetailPage.assessmentStandby')}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
      <div className="mt-6" />
      {(showFloatingTitle || !isShortDescription) && (
        <MobileFloatingIndicator
          enrolledStatus={enrolledStatus}
          onEnroll={onEnroll}
          courseMainCTA={
            isAssessmentCourse() &&
            overallCourseProgress >= 100 &&
            !isRetestable() ? (
              getAssessmentHeaderText()
            ) : (
              <CourseMainCTA
                size="small"
                avoidFullWidth
                courseDetail={courseDetail}
                overallCourseProgress={overallCourseProgress}
                onCTA={() => handleCTA(onValidateCourseOutline, outlineRef)}
              />
            )
          }
          courseProgressIndicator={
            isAssessmentCourse() &&
            overallCourseProgress < 100 &&
            !isRetestable() ? (
              getAssessmentHeaderText()
            ) : (
              <CourseProgressIndicator
                ringClassName="mr-2 w-6 h-6"
                overallCourseProgress={overallCourseProgress}
              />
            )
          }
        />
      )}
    </div>
  );
}
