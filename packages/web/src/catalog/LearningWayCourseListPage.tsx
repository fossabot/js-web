import { useEffect, useMemo, useState } from 'react';
import useTranslation from '../i18n/useTranslation';
import Layout from '../layouts/main.layout';
import Head from 'next/head';
import MainNavBar from '../ui-kit/headers/MainNavbar';
import CourseListContainer from './components/CourseListContainer';
import HeadlineContainer from './components/HeadlineContainer';
import CourseListSidebar from './components/CourseListSidebar';
import CatalogContent from './components/CatalogContent';
import useCourseList from './hooks/useCourseList';
import { useRouter } from 'next/router';
import LearningWayApi from '../http/learning-way.api';
import { withCatalogMenu } from '../hooks/useCatalogMenu';
import CourseFilters from './components/CourseFilters';
import CourseFiltersSkeleton from '../shared/skeletons/CourseFiltersSkeleton';

function LearningWayCourseListPage({ token }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [learningWay, setLearningWay] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const id = router.query.id as string;
  const {
    loading: courseLoading,
    errors,
    courses,
    pagination,
    fetchCourses,
  } = useCourseList({
    id,
    type: 'learningWay',
  });

  async function fetchLearningWay() {
    setLoading(true);
    const data = await LearningWayApi.getLearningWayById(id);
    setLearningWay(data);
  }

  useEffect(() => {
    fetchLearningWay().finally(() => setLoading(false));
  }, [id]);

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {learningWay?.name}
        </title>
      </Head>
    ),
    [learningWay],
  );

  function handleRetry() {
    fetchCourses();
  }

  return withCatalogMenu(
    <Layout
      head={head}
      header={<MainNavBar token={token} theme="transparent" />}
    >
      <CourseListContainer>
        <HeadlineContainer
          name={learningWay?.name}
          description={learningWay?.description}
          loading={loading}
        />
        <div className="my-6 flex flex-col justify-between lg:my-8 lg:flex-row ">
          <CourseListSidebar />
          <div className="mx-6 box-content flex flex-shrink flex-col lg:mr-0 lg:ml-8 lg:w-181">
            {courseLoading ? <CourseFiltersSkeleton /> : <CourseFilters />}
            <CatalogContent
              courses={courses}
              loading={courseLoading}
              errors={errors}
              type="learningWay"
              id={id}
              pagination={pagination}
              handleRetry={handleRetry}
            />
          </div>
        </div>
      </CourseListContainer>
    </Layout>,
  );
}

export default LearningWayCourseListPage;
