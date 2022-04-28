import Head from 'next/head';
import React, { useEffect, useMemo, useState } from 'react';

import TopicApi from '../http/topic.api';
import Layout from '../layouts/main.layout';
import useTranslation from '../i18n/useTranslation';
import HeadlineContainer from './HeadlineContainer';
import MainNavBar from '../ui-kit/headers/MainNavbar';
import LearningTrackFilters from './LearningTrackFilter';
import { withCatalogMenu } from '../hooks/useCatalogMenu';
import useLearningTrackList from './useLearningTrackList';
import LearningTrackListContent from './LearningTrackListContent';
import LearningTrackListSidebar from './LearningTrackListSidebar';
import LearningTrackListContainer from './LearningTrackListContainer';
import CourseFiltersSkeleton from '../shared/skeletons/CourseFiltersSkeleton';

function LearningTrackListPage({ token }) {
  const { t } = useTranslation();
  const [topic, setTopic] = useState(null);
  const [isTopicLoading, setIsTopicLoading] = useState(false);
  const {
    loading: isLearningTracksLoading,
    errors,
    learningTracks,
    pagination,
    topicId,
    fetchLearningTracks,
  } = useLearningTrackList({ itemsPerPage: 12 });

  async function fetchTopic() {
    setIsTopicLoading(true);
    const data = await TopicApi.getTopicById(topicId, false);
    setTopic(data);
    setIsTopicLoading(false);
  }

  useEffect(() => {
    if (topicId) {
      fetchTopic();
    } else {
      setTopic(null);
    }
  }, [topicId]);

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {t('learningTrackListPage.metaTitle')}
        </title>
      </Head>
    ),
    [],
  );

  return withCatalogMenu(
    <Layout
      head={head}
      header={<MainNavBar token={token} theme="transparent" />}
    >
      <LearningTrackListContainer>
        <HeadlineContainer
          name={topic?.name || t('learningTrackListPage.title')}
          description={
            topic?.id
              ? topic.description
              : t('learningTrackListPage.description')
          }
          loading={isTopicLoading}
        />
        <div className="my-6 flex flex-col justify-between lg:my-8 lg:flex-row">
          <LearningTrackListSidebar />
          <div className="mx-6 box-content flex flex-shrink flex-col lg:ml-12 lg:mr-0 lg:w-181">
            {isLearningTracksLoading ? (
              <CourseFiltersSkeleton />
            ) : (
              <LearningTrackFilters />
            )}
            <LearningTrackListContent
              learningTracks={learningTracks}
              errors={errors}
              topicId={topicId}
              loading={isLearningTracksLoading}
              handleRetry={fetchLearningTracks}
              pagination={pagination}
            />
          </div>
        </div>
      </LearningTrackListContainer>
    </Layout>,
  );
}

export default LearningTrackListPage;
