import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AccessControl } from '../../app-state/accessControl';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import { notificationHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import { IEmailLog } from '../../models/emailLogs';

export const EmailLogPreviewPage = () => {
  const { t } = useTranslation();

  const router = useRouter();

  const [emailLog, setEmailLog] =
    useState<undefined | IEmailLog | null>(undefined);

  useEffect(() => {
    notificationHttp
      .get<BaseResponseDto<IEmailLog>>(
        API_PATHS.USER_EMAIL_NOTIFICATIONS_ID.replace(
          ':id',
          router.query.id as string,
        ),
      )
      .then((res) => {
        setEmailLog(res.data.data);
      })
      .catch((err) => {
        setEmailLog(null);
      });
  }, [router.query.id]);

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS,
      ]}
    >
      <Head>
        <title>{t('headerText')} | Email Log Preview</title>
      </Head>
      <div className="mx-auto flex h-full max-w-2xl items-center justify-center p-10">
        {emailLog === undefined && <p>Loading...</p>}
        {emailLog === null && <p>Email log could not be found</p>}
        {emailLog && (
          <iframe className="h-full w-full" srcDoc={emailLog.html}></iframe>
        )}
      </div>
    </AccessControl>
  );
};
