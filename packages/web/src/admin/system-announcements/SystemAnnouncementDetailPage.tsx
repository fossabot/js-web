import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AccessControl } from '../../app-state/accessControl';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import { notificationHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import { ISystemAnnouncement } from '../../models/systemAnnouncement';
import { ChevronLeft } from '../../ui-kit/icons';
import { captureError } from '../../utils/error-routing';
import { SystemAnnouncementForm } from './SystemAnnouncementForm';

export const SystemAnnouncementDetailPage = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const [systemAnnouncment, setSystemAnnouncment] =
    useState<ISystemAnnouncement | undefined | null>(undefined);

  useEffect(() => {
    notificationHttp
      .get<BaseResponseDto<ISystemAnnouncement>>(
        API_PATHS.SYSTEM_ANNOUNCEMENT_DETAIL.replace(
          ':id',
          router.query.id as string,
        ),
      )
      .then(({ data }) => {
        setSystemAnnouncment(data.data);
      })
      .catch((err) => {
        captureError(err);
        setSystemAnnouncment(null);
      });
  }, [router.query.id]);

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_SYSTEM_ANNOUNCEMENT_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>
            {t('headerText')} | {t('systemAnnouncementDetailPage.header')}
          </title>
        </Head>
        <div className="mb-4">
          <a
            role="button"
            onClick={() => {
              router.push(WEB_PATHS.SYSTEM_ANNOUNCEMENT);
            }}
            className="flex items-center space-x-2 text-caption text-gray-650"
          >
            <ChevronLeft className="h-4" />
            <span>{t('back')}</span>
          </a>
        </div>
        <div className="mx-auto max-w-xl">
          <h1 className="text-subtitle font-semibold">
            {t('systemAnnouncementDetailPage.header')}
          </h1>
          <div className="mt-4 mb-8 h-px w-full bg-gray-200"></div>
          {systemAnnouncment === null && (
            <p className="text-center">
              {t('systemAnnouncementDetailPage.notFound')}
            </p>
          )}
          {systemAnnouncment && (
            <SystemAnnouncementForm initialValues={systemAnnouncment} />
          )}
        </div>
      </AdminLayout>
    </AccessControl>
  );
};
