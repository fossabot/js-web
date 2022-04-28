import axios from 'axios';
import { startCase } from 'lodash';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';
import { useEffect, useState } from 'react';
import { IAuthContext } from '../app-state/authContext';
import API_PATHS from '../constants/apiPaths';
import { ERROR_CODES } from '../constants/errors';
import NEXT_API_PATHS from '../constants/nextApiPaths';
import WEB_PATHS from '../constants/webPaths';
import { useScormPlayer } from '../hooks/useScormPlayer';
import { centralHttp } from '../http';
import courseApi from '../http/course.api';
import useTranslation from '../i18n/useTranslation';
import { ICourseOutline } from '../models/course';
import { IScormProgress } from '../models/scorm';
import { SCORM_API } from '../utils/scormAPI';

const PlayerPage = ({ token }: IAuthContext) => {
  const router = useRouter();
  const { id, courseId, courseOutlineId } = router.query;
  const { t } = useTranslation();

  const [topbar, setTopbar] = useState<any>();
  const [outline, setOutline] = useState<ICourseOutline | null>(null);

  const updateLearningProgress = async () => {
    if (!isScormReady) return;

    await courseApi.updateScormProgress(
      id as string,
      {
        metadata: scormAPI.getValue(SCORM_API.CMI),
        location: scormAPI.getValue(SCORM_API.LOCATION),
        status: scormAPI.getValue(SCORM_API.STATUS),
        suspend_data: scormAPI.getValue(SCORM_API.SUSPEND_DATA),
        version: scormVersion,
      } as IScormProgress,
    );
  };

  const { initSCORM, launchUrl, isScormReady, scormAPI, scormVersion } =
    useScormPlayer(token, updateLearningProgress);

  const importTopbar = async () => {
    const lib = await import('topbar');
    setTopbar(lib);
  };

  const getScormToken = async () => await axios.get(NEXT_API_PATHS.SCORM_TOKEN);

  const verifyAccess = async () => {
    try {
      const response = await centralHttp.get(
        API_PATHS.SCORM_VERIFY_ACCESS.replace(
          ':courseOutlineId',
          courseOutlineId as string,
        ),
      );

      setOutline(response.data.data);
    } catch (err) {
      // redirect to course detail page with special query to fetch plan
      if (err?.response?.data?.code === ERROR_CODES.INVALID_SUBSCRIPTION.code) {
        router.push(
          stringifyUrl({
            url: WEB_PATHS.COURSE_DETAIL.replace(':id', courseId as string),
            query: {
              needPlanId: err?.response?.data?.data?.cheapestPlan.id,
              canUpgrade: err?.response?.data?.data?.canUpgrade,
            },
          }),
        );
      }
    }
  };

  const goToCourseDetail = (id: string) => {
    router.push(WEB_PATHS.COURSE_DETAIL.replace(':id', id));
  };

  useEffect(() => {
    if (!topbar) importTopbar();

    return () => {
      if (topbar) topbar.hide();
    };
  }, [topbar]);

  useEffect(() => {
    (async () => {
      if (id && courseId && topbar && courseOutlineId) {
        try {
          topbar.show();
          await verifyAccess();
          await getScormToken();
          await initSCORM(id as string);
        } catch (e) {
          console.error(e);
          topbar.hide();
          goToCourseDetail(courseId as string);
        }
      } else if (!id || !courseId || !courseOutlineId)
        await router.push(WEB_PATHS.MY_PACKAGES);
    })();
  }, [id, token, topbar, courseId, courseOutlineId]);

  return (
    <>
      <Head>
        <title>
          {outline
            ? outline.title[`name${startCase(router.locale)}`]
            : t('scormPlayerPage.init')}
        </title>
      </Head>
      <div className="container relative">
        <div
          className="fixed right-2 top-2 cursor-pointer bg-black bg-opacity-75 px-3 py-1 text-white"
          onClick={() => goToCourseDetail(courseId as string)}
        >
          {t('scormPlayerPage.close')}
        </div>
        {isScormReady && (
          <iframe
            id="scormContent"
            className="h-screen w-screen"
            src={launchUrl}
            onLoad={() => topbar.hide()}
          />
        )}
      </div>
    </>
  );
};

export default PlayerPage;
