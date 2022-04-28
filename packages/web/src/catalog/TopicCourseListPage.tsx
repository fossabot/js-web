import React, { useEffect, useMemo, useState } from 'react';
import useTranslation from '../i18n/useTranslation';
import Layout from '../layouts/main.layout';
import Head from 'next/head';
import MainNavBar from '../ui-kit/headers/MainNavbar';
import CourseListContainer from './components/CourseListContainer';
import HeadlineContainer from './components/HeadlineContainer';
import CourseListSidebar from './components/CourseListSidebar';
import SubTopicList from './components/SubTopicList';
import useCourseList from './hooks/useCourseList';
import { useRouter } from 'next/router';
import TopicApi from '../http/topic.api';
import { withCatalogMenu } from '../hooks/useCatalogMenu';
import CourseFilters from './components/CourseFilters';
import CatalogContent from './components/CatalogContent';
import CourseFiltersSkeleton from '../shared/skeletons/CourseFiltersSkeleton';
import { Topic } from '../models/topic';
import { captureError } from '../utils/error-routing';

function TopicCourseListPage({ token }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [topic, setTopic] = useState<Topic>(undefined);
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
    type: 'topic',
  });

  async function fetchTopic() {
    setLoading(true);
    const data = await TopicApi.getTopicById(id, true);
    setTopic(data);
  }

  useEffect(() => {
    fetchTopic()
      .catch(captureError)
      .finally(() => setLoading(false));
  }, [id]);

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {topic?.name}
        </title>
      </Head>
    ),
    [topic],
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
          name={topic?.name}
          description={topic?.description}
          loading={loading}
          parentTopic={topic?.parent}
        >
          <SubTopicList topics={topic?.children} maxSubTopics={6} />
        </HeadlineContainer>
        <div className="my-6 flex flex-col justify-between lg:my-8 lg:flex-row ">
          <CourseListSidebar />
          <div className="mx-6 box-content flex flex-shrink flex-col lg:ml-12 lg:mr-0 lg:w-181">
            {courseLoading ? <CourseFiltersSkeleton /> : <CourseFilters />}
            <CatalogContent
              courses={courses}
              loading={courseLoading}
              errors={errors}
              pagination={pagination}
              handleRetry={handleRetry}
              id={id}
              type="topic"
            />
          </div>
        </div>
      </CourseListContainer>
    </Layout>,
  );
}

export default TopicCourseListPage;
