import cx from 'classnames';

import useTranslation from '../i18n/useTranslation';
import {
  ILearningTrackDetail,
  ILearningTrackSectionDetail,
  ISectionCourse,
} from '../models/learningTrack';
import SectionCourse from './SectionCourse';
import { ICourseDetail } from '../models/course';
import { CollapsableSection } from './CollapsableSection';
import { getOverallLearningTrackSectionProgress } from './helper';
import { InProgressIndicator } from '../ui-kit/InProgressIndicator';
import { IdleProgressIndicator } from '../ui-kit/IdleProgressIndicator';
import { CompleteProgressIndicator } from '../ui-kit/CompleteProgressIndicator';

export default function LearningTrackSectionItem({
  section,
  index,
  learningTrackDetail,
}: {
  section: ILearningTrackSectionDetail;
  index: number;
  learningTrackDetail: ILearningTrackDetail;
}) {
  const { t } = useTranslation();

  const overallLearningTrackSectionProgress =
    getOverallLearningTrackSectionProgress(section.courses as ICourseDetail[]);

  const renderProgress = () => {
    if (overallLearningTrackSectionProgress >= 100) {
      return <CompleteProgressIndicator />;
    }
    if (overallLearningTrackSectionProgress <= 0) {
      return <IdleProgressIndicator />;
    }
    return <InProgressIndicator />;
  };

  const renderProgressPill = () => {
    return (
      <div
        className={cx(
          'hidden rounded-2xl py-0.5 px-3 text-caption font-semibold lg:block',
          {
            'bg-green-100 text-green-300':
              overallLearningTrackSectionProgress >= 100,
            'bg-gray-200 text-gray-500':
              overallLearningTrackSectionProgress <= 0,
            'bg-yellow-100 text-yellow-400':
              overallLearningTrackSectionProgress > 0 &&
              overallLearningTrackSectionProgress < 100,
          },
        )}
      >
        {overallLearningTrackSectionProgress >= 100 &&
          t('learningTrackDetailPage.completed')}
        {overallLearningTrackSectionProgress <= 0 &&
          t('learningTrackDetailPage.notStarted')}
        {overallLearningTrackSectionProgress > 0 &&
          overallLearningTrackSectionProgress < 100 &&
          t('learningTrackDetailPage.inProgress')}
      </div>
    );
  };

  const Title = () => {
    return (
      <div className="mt-2.5 flex flex-row items-center justify-start">
        <div>{renderProgress()}</div>
        <div className="mx-2 lg:mx-4">
          <p className="max-w-full text-left text-body font-semibold line-clamp-1 lg:max-w-md lg:text-heading">
            {(index + 1).toLocaleString(undefined, {
              minimumIntegerDigits: 2,
            })}{' '}
            {section.title}
          </p>
        </div>
        {renderProgressPill()}
      </div>
    );
  };

  return (
    <div className="mb-4 lg:mb-0">
      <CollapsableSection title={<Title />} defaultOpen>
        <div className="space-y-1 border-t border-gray-200 bg-gray-200 lg:space-y-4 lg:rounded-2xl lg:rounded-t-none lg:border-l lg:border-r lg:border-b lg:border-t-0 lg:bg-gray-100 lg:pt-2 lg:pb-4 lg:pl-16 lg:pr-4">
          {section.courses.map((course) => (
            <SectionCourse
              key={course.id}
              courseDetail={course as ISectionCourse}
            />
          ))}
        </div>
      </CollapsableSection>
      <div
        className={cx('ml-8 hidden h-4 border-l-2 border-gray-200', {
          'lg:block':
            index < learningTrackDetail.learningTrackSections.length - 1,
        })}
      ></div>
    </div>
  );
}
