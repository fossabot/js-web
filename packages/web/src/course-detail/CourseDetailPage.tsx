import Head from 'next/head';
import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import API_PATHS from '../constants/apiPaths';
import { ERROR_CODES } from '../constants/errors';
import WEB_PATHS from '../constants/webPaths';
import PreBookCourseSessionModal from '../course-session/PreBookCourseSessionModal';
import { centralHttp, paymentHttp } from '../http';
import CourseApi from '../http/course.api';
import useTranslation from '../i18n/useTranslation';
import Layout from '../layouts/main.layout';
import {
  CourseCategoryKey,
  CourseSubCategoryKey,
  ICourse,
  ICourseDetail,
  ICourseOutlineDetail,
} from '../models/course';
import { MediaExtended } from '../models/media';
import MainNavBar from '../ui-kit/headers/MainNavbar';
import { useModal } from '../ui-kit/Modal';
import PlanUpgradeModal, {
  CheapestPlan,
  usePlanUpgradeModal,
} from '../ui-kit/PlanUpgradeModal';
import CourseDetailBody from './CourseDetailBody';
import CourseDetailContainer from './CourseDetailContainer';
import CourseDetailHeader from './CourseDetailHeader';
import PreRequisiteCourseModal from './PreRequisiteCourseModal';

export type ValidateCourseOutlineParams =
  | { type: 'VALIDATE_OUTLINE'; outlineId: ICourseOutlineDetail['id'] }
  | { type: 'VALIDATE_COURSE'; courseId: ICourse['id'] }
  | { type: 'DONT_VALIDATE'; plan: CheapestPlan; canUpgrade: boolean };

export interface IEnrolledStatus {
  success: boolean;
  preRequisiteCourse?: ICourseDetail<string>;
}

function CourseDetailPage({ token }) {
  const { t } = useTranslation();
  const router = useRouter();
  const outlineRef = useRef(null);

  const [enrolledStatus, setEnrolledStatus] = useState<IEnrolledStatus>(null);
  const [courseDetail, setCourseDetail] = useState<ICourseDetail>(null);
  const [modalData, setModalData] = useState(null);
  const [showPreRequisiteModal, setShowPreRequisiteModal] = useState(false);
  const planUpgradeModalProps = usePlanUpgradeModal();
  const preBookModalProps = useModal();
  const [videos, setVideos] = useState<MediaExtended[]>([]);
  const [hasCertificate, setHasCertificate] = useState(false);

  const id = router.query.id as string;
  const needPlanId = router.query.needPlanId as string | undefined;

  async function fetchCourseDetail() {
    const { data } = await centralHttp.get(
      API_PATHS.COURSE_DETAIL.replace(':id', id),
    );
    setCourseDetail(data?.data);
    setEnrolledStatus(
      data?.data?.userEnrolledCourse?.length > 0 && { success: true },
    );

    if (data?.data?.id) {
      fetchCertificate(data?.data.id);
    }

    if (data?.data?.courseOutlines?.length) {
      if (
        data?.data?.category.key === CourseCategoryKey.ONLINE_LEARNING &&
        data?.data?.courseOutlines.some(
          (co) => co.category.key == CourseSubCategoryKey.VIDEO,
        )
      ) {
        fetchAllCourseMedia(data?.data?.id);
      }
    }
  }

  async function fetchAllCourseMedia(courseId) {
    const videos = await CourseApi.getAllVideos(courseId);
    setVideos(videos);
  }

  async function fetchCertificate(courseId) {
    const data = await CourseApi.checkCertificates([courseId]);
    const hasCertificate = data[courseId];
    setHasCertificate(hasCertificate);
  }

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {courseDetail?.title}
        </title>
      </Head>
    ),
    [courseDetail?.id],
  );

  const onEnroll = async () => {
    try {
      const { data } = await centralHttp.post(
        API_PATHS.COURSE_ENROLL.replace(':id', courseDetail.id),
      );

      if (!data?.data.success) {
        setShowPreRequisiteModal(true);
      }

      setEnrolledStatus(data?.data);
    } catch (err) {
      switch (err?.response?.data?.code) {
        case ERROR_CODES.INVALID_SUBSCRIPTION.code: {
          planUpgradeModalProps.setCheapestPlan(
            err?.response?.data?.data?.cheapestPlan,
          );
          planUpgradeModalProps.setCanUpgrade(
            err?.response?.data?.data?.canUpgrade,
          );
          planUpgradeModalProps.toggle();
          break;
        }
      }
    }
  };

  const onValidateCourseOutline = useCallback(
    async (params: ValidateCourseOutlineParams) => {
      if (
        params.type === 'VALIDATE_COURSE' ||
        params.type === 'VALIDATE_OUTLINE'
      ) {
        try {
          if (params.type === 'VALIDATE_COURSE') {
            await centralHttp.post(
              API_PATHS.COURSE_VALIDATE_PLAN.replace(':id', params.courseId),
            );
          }
          if (params.type === 'VALIDATE_OUTLINE') {
            await centralHttp.post(
              API_PATHS.COURSE_OUTLINE_VALIDATE.replace(
                ':id',
                params.outlineId,
              ),
            );
          }
          return true;
        } catch (err) {
          switch (err?.response?.data?.code) {
            case ERROR_CODES.INVALID_SUBSCRIPTION.code: {
              planUpgradeModalProps.setCheapestPlan(
                err.response.data.data.cheapestPlan,
              );
              planUpgradeModalProps.setCanUpgrade(
                err.response.data.data.canUpgrade,
              );
              planUpgradeModalProps.toggle();
              break;
            }
            case ERROR_CODES.PREVIOUS_OUTLINE_NOT_BOOKED.code: {
              setModalData(err.response.data.data.courseOutline);
              preBookModalProps.toggle();
              break;
            }
          }
          return false;
        }
      } else {
        planUpgradeModalProps.setCheapestPlan(params.plan);
        planUpgradeModalProps.setCanUpgrade(params.canUpgrade);
        planUpgradeModalProps.toggle();
        return false;
      }
    },
    [],
  );

  useEffect(() => {
    // if query exists in URL
    if (needPlanId) {
      paymentHttp
        .get(API_PATHS.PLAN_DETAIL.replace(':planId', needPlanId))
        .then(({ data }) => {
          // show plan upgrade modal and remove query from URL
          onValidateCourseOutline({
            type: 'DONT_VALIDATE',
            plan: data.data,
            canUpgrade: router.query.canUpgrade === 'true',
          });
        })
        .catch(console.error)
        .finally(() => {
          const newQuery = { ...router.query };
          delete newQuery.needPlanId;
          delete newQuery.canUpgrade;
          router.replace(
            stringifyUrl({
              url: WEB_PATHS.COURSE_DETAIL.replace(':id', id),
              query: newQuery,
            }),
            undefined,
            { shallow: true },
          );
        });
    }
  }, [needPlanId]);

  if (!courseDetail) {
    return null;
  }

  return (
    <Layout
      head={head}
      header={<MainNavBar token={token} theme="transparent" />}
    >
      <PreRequisiteCourseModal
        course={enrolledStatus?.preRequisiteCourse}
        showPreRequisiteModal={showPreRequisiteModal}
        setShowPreRequisiteModal={setShowPreRequisiteModal}
      />
      <PlanUpgradeModal {...planUpgradeModalProps} />
      <PreBookCourseSessionModal
        {...{
          ...preBookModalProps,
          onClose: () => setModalData(null),
          courseOutline: modalData,
        }}
      />
      <CourseDetailContainer>
        <CourseDetailHeader
          onEnroll={onEnroll}
          outlineRef={outlineRef}
          courseDetail={courseDetail}
          enrolledStatus={enrolledStatus}
          onValidateCourseOutline={onValidateCourseOutline}
        />
        <CourseDetailBody
          onEnroll={onEnroll}
          outlineRef={outlineRef}
          courseDetail={courseDetail}
          enrolledStatus={enrolledStatus}
          onValidateCourseOutline={onValidateCourseOutline}
          videos={videos}
          hasCertificate={hasCertificate}
        />
      </CourseDetailContainer>
    </Layout>
  );
}

export default CourseDetailPage;
