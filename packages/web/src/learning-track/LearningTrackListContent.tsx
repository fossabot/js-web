import LoadError from '../ui-kit/LoadError';
import LoadEmpty from '../ui-kit/LoadEmpty';
import LearningTrackItem from './LearningTrackItem';
import { ILearningTrack } from '../models/learningTrack';
import IPaginationParams from '../models/IPaginationParams';
import CourseLoading from '../shared/skeletons/CourseLoading';
import PaginationIndicator from '../shared/PaginationIndicator';
import CoursePaginationSkeleton from '../shared/skeletons/CoursePaginationSkeleton';
import useTranslation from '../i18n/useTranslation';

interface ILearningTrackListContent {
  learningTracks: ILearningTrack<string>[];
  errors: string[];
  topicId: string;
  loading: boolean;
  pagination: IPaginationParams;
  handleRetry: () => void;
}

export default function LearningTrackListContent({
  learningTracks,
  errors,
  topicId,
  loading,
  pagination,
  handleRetry,
}: ILearningTrackListContent) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <>
        <CourseLoading />
        <CoursePaginationSkeleton />
      </>
    );
  } else if (errors && errors.length) {
    return (
      <LoadError
        onRetry={handleRetry}
        imageSrc="/assets/course/error.png"
        loadErrorMsg={t('learningTrackListPage.errorLoading')}
        retryMsg={t('retry')}
      />
    );
  } else if (learningTracks.length > 0) {
    return (
      <>
        <div className="flex w-full flex-wrap gap-6">
          {learningTracks.map((learningTrack, index) => (
            <LearningTrackItem
              key={index}
              topicId={topicId}
              learningTrack={learningTrack}
            />
          ))}
        </div>
        <PaginationIndicator
          resultLength={learningTracks.length}
          defaultPerPage={pagination.perPage}
          totalPages={pagination.totalPages}
          totalRecords={pagination.total}
        />
      </>
    );
  } else {
    return (
      <LoadEmpty
        imageSrc="/assets/course/empty.png"
        msg={t('learningTrackListPage.emptyList')}
      />
    );
  }
}
