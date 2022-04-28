import CourseList from './CourseList';
import CourseLoading from '../../shared/skeletons/CourseLoading';
import { ICourse } from '../../models/course';
import LoadError from '../../ui-kit/LoadError';
import LoadEmpty from '../../ui-kit/LoadEmpty';
import useTranslation from '../../i18n/useTranslation';
import IPaginationParams from '../../models/IPaginationParams';
import PaginationIndicator from '../../shared/PaginationIndicator';
import CoursePaginationSkeleton from '../../shared/skeletons/CoursePaginationSkeleton';

interface ICatalogContent {
  courses: ICourse<string>[];
  errors: string[];
  loading: boolean;
  pagination: IPaginationParams;
  handleRetry: () => void;
  id: string;
  type: string;
}

export default function CatalogContent({
  courses,
  errors,
  loading,
  pagination,
  handleRetry,
  id,
  type,
}: ICatalogContent) {
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
        loadErrorMsg={t('catalogList.loadError')}
        retryMsg={t('catalogList.retry')}
      />
    );
  } else if (courses.length) {
    return (
      <>
        <CourseList courses={courses} id={id} type={type} />
        <PaginationIndicator
          resultLength={courses.length}
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
        msg={t('catalogList.noCourseAvailable')}
      />
    );
  }
}
