import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { centralHttp } from '../http';
import Layout from '../layouts/main.layout';
import API_PATHS from '../constants/apiPaths';
import useTranslation from '../i18n/useTranslation';
import MainNavBar from '../ui-kit/headers/MainNavbar';
import { ILearningTrackDetail } from '../models/learningTrack';
import LearningTrackDetailBody from './LearningTrackDetailBody';
import LearningTrackDetailHeader from './LearningTrackDetailHeader';
import LearningTrackDetailContainer from './LearningTrackDetailContainer';

export interface IEnrolledStatus {
  success: boolean;
}

function LearningTrackDetailPage({ token }) {
  const { t } = useTranslation();
  const router = useRouter();
  const outlineRef = useRef(null);
  const [enrolledStatus, setEnrolledStatus] = useState<IEnrolledStatus>(null);
  const [learningTrackDetail, setLearningTrackDetail] =
    useState<ILearningTrackDetail>(null);

  const id = router.query.id as string;

  async function fetchLearningTrackDetail() {
    const { data }: { data: { data: ILearningTrackDetail } } =
      await centralHttp.get(API_PATHS.LEARNING_TRACK_DETAIL.replace(':id', id));

    setLearningTrackDetail(data?.data);
    setEnrolledStatus(
      data?.data?.userEnrolledLearningTrack?.length > 0 && { success: true },
    );
  }

  useEffect(() => {
    fetchLearningTrackDetail();
  }, [id]);

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {learningTrackDetail?.title}
        </title>
      </Head>
    ),
    [learningTrackDetail?.id],
  );

  const onEnroll = async () => {
    try {
      const { data } = await centralHttp.post(
        API_PATHS.LEARNING_TRACK_ENROLL.replace(':id', learningTrackDetail.id),
      );

      if (!data?.data.success) {
        throw new Error('Something went wrong.');
      }

      setEnrolledStatus(data?.data);
    } catch (error) {
      console.error('error', error);
    }
  };

  if (!learningTrackDetail) {
    return null;
  }

  return (
    <Layout
      head={head}
      header={<MainNavBar token={token} theme="transparent" />}
    >
      <LearningTrackDetailContainer>
        <LearningTrackDetailHeader
          onEnroll={onEnroll}
          outlineRef={outlineRef}
          enrolledStatus={enrolledStatus}
          learningTrackDetail={learningTrackDetail}
        />
        <LearningTrackDetailBody
          onEnroll={onEnroll}
          outlineRef={outlineRef}
          enrolledStatus={enrolledStatus}
          learningTrackDetail={learningTrackDetail}
        />
      </LearningTrackDetailContainer>
    </Layout>
  );
}

export default LearningTrackDetailPage;
