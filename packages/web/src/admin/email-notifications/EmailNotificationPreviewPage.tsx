import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import { AccessControl } from '../../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import useTranslation from '../../i18n/useTranslation';
import { ITokenProps } from '../../models/auth';
import { useEmailNotificationPreviewPage } from './useEmailNotificationPreviewPage';

export const EmailNotificationPreviewPage: NextPage<ITokenProps> = () => {
  const {
    getValues,
    getBodyHTML,
    emailNotificationPreview,
    emailFormatPreview,
  } = useEmailNotificationPreviewPage();
  const { t } = useTranslation();

  useEffect(() => {
    getValues();
  }, []);

  if (!emailNotificationPreview || !emailFormatPreview) return null;

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS,
      ]}
    >
      <Head>
        <title>
          {t('headerText')} |{' '}
          {t('emailNotificationPreviewPage.emailNotificationPreview')}
        </title>
      </Head>
      <div className="mx-auto w-140 py-10 text-caption">
        <section className="rounded-2xl bg-gray-100  p-12">
          {emailFormatPreview.headerImageKey && (
            <img
              src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${emailFormatPreview.headerImageKey}`}
            />
          )}
          <div
            className="mt-8 text-caption"
            dangerouslySetInnerHTML={{
              __html: getBodyHTML(),
            }}
          ></div>
          <div className="mt-4 text-caption">{emailFormatPreview.teamName}</div>
          <div className="mt-8 border-t border-gray-200" />
          {emailFormatPreview.footerImageKey && (
            <img
              src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${emailFormatPreview.footerImageKey}`}
              className="mx-auto mt-8 rounded-xl"
            />
          )}
          <aside
            className="mt-8"
            dangerouslySetInnerHTML={{ __html: emailFormatPreview.footerHTML }}
          ></aside>
          <aside className="mt-6 text-center text-footnote text-gray-500">
            —This is an automatically generated email, please do not reply—
          </aside>
        </section>
        <footer className="m-auto mt-8 text-center text-footnote text-gray-400">
          {emailFormatPreview.copyrightText}
        </footer>
      </div>
    </AccessControl>
  );
};
