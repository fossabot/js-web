import cx from 'classnames';
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';

import useTranslation from '../i18n/useTranslation';
import { ILearningTrackDetail } from '../models/learningTrack';
import { MaterialExternal, MaterialInternal } from '../models/baseMaterial';
import {
  BurgerMenu,
  CourseCount,
  FileDownload,
  Info,
  LearningTrack,
} from '../ui-kit/icons';
import MaterialItem from './MaterialItem';
import LearningTrackMainCTA from './LearningTrackMainCTA';
import LearningTrackSection from './LearningTrackSection';
import { getOverallLearningTrackProgress } from './helper';
import { IEnrolledStatus } from './LearningTrackDetailPage';
import MobileFloatingIndicator from './MobileFloatingIndicator';
import CourseProgressIndicator from '../course-detail/CourseProgressRing';
import CourseDetailMarkdownWithTitle from '../course-detail/CourseDetailMarkdownWithTitle';
import { useResponsive } from '../hooks/useResponsive';
import Button from '../ui-kit/Button';

export default function LearningTrackDetailBody({
  learningTrackDetail,
  enrolledStatus,
  onEnroll,
  outlineRef,
}: {
  onEnroll: () => Promise<void>;
  learningTrackDetail: ILearningTrackDetail;
  enrolledStatus: IEnrolledStatus;
  outlineRef: MutableRefObject<any>;
}) {
  const contentRef = useRef(null);
  const materialsRef = useRef(null);
  const [showFloatingTitle, setShowFloatingTitle] = useState(false);
  const [isShortDescription, setIsShortDescription] = useState(false);
  const { lg } = useResponsive();
  const { t } = useTranslation();

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
  }, [isShortDescription]);

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

  const overallLearningTrackProgress = getOverallLearningTrackProgress(
    learningTrackDetail.learningTrackSections,
  );

  const executeScroll = (ref) =>
    ref.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });

  const currentCourseOutline = null;

  return (
    <div className="relative mx-6 flex flex-col py-8 lg:mx-0 lg:flex-row lg:py-12">
      <div className="sticky top-20 hidden flex-col self-start lg:flex">
        <ul className="mr-4 flex w-55 flex-none flex-col items-start text-caption font-semibold">
          <li
            onClick={() => executeScroll(contentRef)}
            className={cx(
              'group flex w-full cursor-pointer items-center rounded-t-2xl border-t border-l border-r border-gray-200 p-4',
            )}
          >
            <Info className="mr-3 inline h-5 w-5 text-gray-400 group-hover:text-brand-primary" />
            <span className="text-gray-650 group-hover:text-brand-primary">
              {t('learningTrackDetailPage.about')}
            </span>
          </li>
          {learningTrackDetail.materials.length > 0 && (
            <li
              onClick={() => executeScroll(materialsRef)}
              className="group flex w-full cursor-pointer items-center border border-t-0 border-b-0 border-gray-200 p-4"
            >
              <FileDownload className="mr-3 inline h-5 w-5 text-gray-400 group-hover:text-brand-primary" />
              <span className="text-gray-650 group-hover:text-brand-primary">
                {t('learningTrackDetailPage.material')}
              </span>
            </li>
          )}
          <li
            onClick={() => executeScroll(outlineRef)}
            className="group flex w-full cursor-pointer items-center rounded-b-2xl border border-t-0 border-gray-200 p-4"
          >
            <BurgerMenu className="mr-3 inline h-5 w-5 text-gray-400 group-hover:text-brand-primary" />
            <span className="text-gray-650 group-hover:text-brand-primary">
              {t('learningTrackDetailPage.outline')}
            </span>
          </li>
        </ul>
        {showFloatingTitle && enrolledStatus?.success && (
          <div className="mr-4 mt-4 flex w-55 flex-col items-start rounded-2xl border border-gray-200 p-4 text-caption font-semibold">
            <div className="w-full text-caption font-semibold">
              <div className="mb-4">{learningTrackDetail.title}</div>
              <div className="mb-3 flex items-center">
                <CourseProgressIndicator
                  ringClassName="mr-1 w-5 h-5"
                  overallCourseProgress={overallLearningTrackProgress}
                />
              </div>
            </div>
            {overallLearningTrackProgress >= 100 ? null : (
              <div className="flex w-full flex-col border-t border-gray-200 pt-3">
                {currentCourseOutline && (
                  <div className="mb-2 text-footnote font-normal line-clamp-3">
                    {currentCourseOutline.text}
                  </div>
                )}
                <LearningTrackMainCTA
                  outlineRef={outlineRef}
                  overallLearningTrackProgress={overallLearningTrackProgress}
                />
              </div>
            )}
          </div>
        )}
        {showFloatingTitle && !enrolledStatus?.success && (
          <div className="mr-4 mt-4 flex w-55 flex-col items-start divide-y divide-gray-200 rounded-2xl border border-gray-200 p-4 text-caption font-semibold">
            <div className="mb-3 w-full text-caption font-semibold">
              {learningTrackDetail.title}
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
            {t('learningTrackDetailPage.about')}
          </h3>
          <div className="my-6 flex flex-row">
            <span className="mr-1 flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-caption font-semibold">
              <LearningTrack className="mr-2 h-4 w-4" />
              {t('learningTrackDetailPage.learningTrack')}
            </span>
            <span className="ml-1 flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-caption font-semibold">
              <CourseCount className="mr-2 h-4 w-4 text-gray-400" />
              <span>
                {t('learningTrackDetailPage.courseCount', {
                  count: learningTrackDetail.learningTrackSections
                    .map((lts) => lts.courseIds)
                    .flat().length,
                })}
              </span>
            </span>
          </div>
          <CourseDetailMarkdownWithTitle
            title={t('learningTrackDetailPage.description')}
            content={learningTrackDetail.description}
          />
          <CourseDetailMarkdownWithTitle
            title={t('learningTrackDetailPage.whoThisLearningTrackIsFor')}
            content={learningTrackDetail.learningTrackTarget}
          />
          <CourseDetailMarkdownWithTitle
            title={t('learningTrackDetailPage.whatYouWillLearn')}
            content={learningTrackDetail.learningObjective}
          />
        </div>
        {learningTrackDetail.materials.length > 0 ? (
          <div className="relative w-full border-t border-gray-200 py-2">
            <div ref={materialsRef} className="absolute -top-20"></div>
            <h3 className="mt-4 mb-6 flex items-center text-heading font-semibold text-black">
              <FileDownload className="mr-2 inline h-6 w-6" />
              {t('learningTrackDetailPage.material')}
            </h3>
            {learningTrackDetail.materials.map(
              (material: MaterialInternal | MaterialExternal) => (
                <MaterialItem
                  key={material.id}
                  material={material}
                  enrolledStatus={enrolledStatus}
                  learningTrackDetail={learningTrackDetail}
                />
              ),
            )}
          </div>
        ) : null}
        <div className="relative w-full border-t border-gray-200 py-2">
          <div ref={outlineRef} className="absolute -top-20"></div>
          <LearningTrackSection learningTrackDetail={learningTrackDetail} />
        </div>
      </div>
      {showFloatingTitle && enrolledStatus?.success && (
        <MobileFloatingIndicator
          onEnroll={onEnroll}
          outlineRef={outlineRef}
          enrolledStatus={enrolledStatus}
          overallLearningTrackProgress={overallLearningTrackProgress}
        />
      )}
      {showFloatingTitle && !enrolledStatus?.success && !isShortDescription && (
        <MobileFloatingIndicator
          onEnroll={onEnroll}
          outlineRef={outlineRef}
          enrolledStatus={enrolledStatus}
          overallLearningTrackProgress={overallLearningTrackProgress}
        />
      )}
    </div>
  );
}
