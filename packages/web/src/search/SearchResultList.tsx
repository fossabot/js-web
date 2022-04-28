import LoadError from '../ui-kit/LoadError';
import LoadEmpty from '../ui-kit/LoadEmpty';
import InstructorCard from './InstructorCard';
import SearchResultCard from './SearchResultCard';
import useTranslation from '../i18n/useTranslation';
import IPaginationParams from '../models/IPaginationParams';
import { searchTypes } from '../ui-kit/headers/useSearchBar';
import CourseLoading from '../shared/skeletons/CourseLoading';
import PaginationIndicator from '../shared/PaginationIndicator';
import CoursePaginationSkeleton from '../shared/skeletons/CoursePaginationSkeleton';

interface ISearchResultList {
  results: any[];
  errors: string[];
  loading: boolean;
  pagination: IPaginationParams;
  handleRetry: () => void;
  type: string;
  subType: string;
  hasFilters: boolean;
  onClearFilter: () => void;
}

export default function SearchResultList({
  results,
  errors,
  loading,
  pagination,
  handleRetry,
  type,
  subType,
  hasFilters,
  onClearFilter,
}: ISearchResultList) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <>
        <CourseLoading />
        <CoursePaginationSkeleton />
      </>
    );
  }
  if (errors && errors.length) {
    return (
      <LoadError
        onRetry={handleRetry}
        imageSrc="/assets/course/error.png"
        loadErrorMsg={t('searchResultPage.loadError')}
        retryMsg={t('searchResultPage.retry')}
      />
    );
  }

  if (type === searchTypes.INSTRUCTOR) {
    if (results.length) {
      return (
        <>
          <div className="flex w-full flex-wrap gap-6">
            {results.map((r, i) => (
              <InstructorCard key={i} {...r} />
            ))}
          </div>
          <PaginationIndicator
            resultLength={results.length}
            defaultPerPage={pagination.perPage}
            totalPages={pagination.totalPages}
            totalRecords={pagination.total}
          />
        </>
      );
    } else {
      return (
        <LoadEmpty
          className="h-55 w-55"
          textColorClassName="text-black"
          imageSrc="/assets/course/course-not-found-search.png"
          msg={t('searchResultPage.noInstructorFound')}
          hasFilters={hasFilters}
          onClear={onClearFilter}
          filterClearText={t('searchResultPage.clearAllFilters')}
        />
      );
    }
  }

  if (
    type === searchTypes.LEARNING_TRACK ||
    type === searchTypes.COURSE ||
    type === searchTypes.LINE_OF_LEARNING
  ) {
    if (results.length) {
      return (
        <>
          <div className="flex w-full flex-wrap gap-6">
            {results.map((r, i) => (
              <SearchResultCard
                key={i}
                {...r}
                searchType={type}
                searchSubType={subType}
                assignmentType={
                  r.userAssignedCourse?.[0]?.assignmentType ||
                  r.userAssignedLearningTrack?.[0]?.assignmentType
                }
              />
            ))}
          </div>
          <PaginationIndicator
            resultLength={results.length}
            defaultPerPage={pagination.perPage}
            totalPages={pagination.totalPages}
            totalRecords={pagination.total}
          />
        </>
      );
    } else {
      return (
        <LoadEmpty
          className="h-55 w-55"
          textColorClassName="text-black"
          imageSrc="/assets/course/course-not-found-search.png"
          msg={
            type === searchTypes.LEARNING_TRACK
              ? t('searchResultPage.noLearningTrackFound')
              : t('searchResultPage.noCourseFound')
          }
          hasFilters={hasFilters}
          onClear={onClearFilter}
          filterClearText={t('searchResultPage.clearAllFilters')}
        />
      );
    }
  }

  return (
    <LoadEmpty
      className="h-55 w-55"
      textColorClassName="text-black"
      imageSrc="/assets/course/course-not-found-search.png"
      msg={t('searchResultPage.noCourseFound')}
      hasFilters={hasFilters}
      onClear={onClearFilter}
      filterClearText={t('searchResultPage.clearAllFilters')}
    />
  );
}
