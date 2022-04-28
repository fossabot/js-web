import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import { AccessControl } from '../../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import useTranslation from '../../i18n/useTranslation';
import { ITokenProps } from '../../models/auth';
import { useEmailFormatPreviewPage } from './useEmailFormatPreviewPage';
import cx from 'classnames';

export const EmailFormatPreviewPage: NextPage<ITokenProps> = () => {
  const { getValues, formatPreview } = useEmailFormatPreviewPage();
  const { t } = useTranslation();

  useEffect(() => {
    getValues();
  }, []);

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS,
      ]}
    >
      <Head>
        <title>
          {t('headerText')} | {t('emailFormatPreviewPage.emailFormatPreview')}{' '}
          {formatPreview.formatName}
        </title>
      </Head>
      <div className="mx-auto w-1/2 py-10">
        <section className="rounded-2xl bg-gray-100  p-12">
          {formatPreview.headerImage && <img src={formatPreview.headerImage} />}
          <div
            className={cx('text-subtitle font-bold', {
              'mt-8': !!formatPreview.headerImage,
            })}
          >
            {t('emailFormatPreviewPage.previewFormat')}
          </div>
          <div className="mt-8 text-caption">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Porttitor
            varius diam ipsum venenatis sed orci nunc. Vel, a dictumst id
            libero, sit. Tellus amet aliquam vulputate massa integer eget eget
            eros, sit. Vestibulum quam ornare non eget mi urna tempus. Nunc sit
            mauris neque in. Ac arcu in orci ultricies egestas donec fusce
            vitae.
          </div>
          <div className="mt-4 text-caption">{formatPreview.teamName}</div>
          <div className="mt-8 border-t border-gray-200" />
          {formatPreview.footerImage && (
            <img
              src={formatPreview.footerImage}
              className="mx-auto mt-8 rounded-xl"
            />
          )}
          <aside
            className="mt-8"
            dangerouslySetInnerHTML={{ __html: formatPreview.footerHTML }}
          ></aside>
          <aside className="mt-6 text-footnote text-gray-500">
            —This is an automatically generated email, please do not reply—
          </aside>
        </section>
        <footer className="m-auto mt-8 text-center text-footnote text-gray-400">
          {formatPreview.copyrightText}
        </footer>
      </div>
    </AccessControl>
  );
};
