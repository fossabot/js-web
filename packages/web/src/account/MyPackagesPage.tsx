import Head from 'next/head';
import useTranslation from '../i18n/useTranslation';
import Layout from '../layouts/main.layout';
import MainNavbar from '../ui-kit/headers/MainNavbar';
import UserSidebar from '../ui-kit/sidebars/UserSidebar';
import React, { useEffect, useMemo } from 'react';
import PackageItem from './PackageItem';
import NoActivePackageBox from './NoActivePackageBox';
import Button from '../ui-kit/Button';
import { CloudDownload } from '../ui-kit/icons';
import { useMyPackagesPage } from './useMyPackagesPage';

function MyPackagesPage({ token }) {
  const { t } = useTranslation();
  const {
    fetchMySubscriptions,
    isRequesting,
    activeSubscriptions,
    expiredSubscriptions,
    downloadCourseActivitiesRecord,
  } = useMyPackagesPage();

  useEffect(() => {
    fetchMySubscriptions();
  }, []);

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {t('myPackagesPage.metaTitle')}
        </title>
      </Head>
    ),
    [],
  );

  return (
    <Layout
      head={head}
      header={<MainNavbar token={token} />}
      sidebar={<UserSidebar />}
      includeSidebar={true}
    >
      {isRequesting ? (
        <></>
      ) : (
        <div className="box-content 2xl:mx-auto 2xl:w-278">
          <div className="lg:flex lg:items-center lg:justify-between">
            <h2 className="w-full text-subheading font-semibold text-black">
              {t('myPackagesPage.currentlyActive')}
            </h2>
            <Button
              avoidFullWidth
              variant="secondary"
              className="mt-6 flex w-full items-center space-x-1 py-2 px-5 lg:mt-0 lg:w-auto"
              onClick={downloadCourseActivitiesRecord}
            >
              <CloudDownload />
              <span className="whitespace-nowrap font-semibold">
                {t('myPackagesPage.learningRecord')}
              </span>
            </Button>
          </div>
          <div className="mt-4 2xl:flex 2xl:flex-row 2xl:flex-wrap 2xl:items-center 2xl:justify-between">
            {activeSubscriptions && activeSubscriptions.length > 0 ? (
              activeSubscriptions.map((s, index) => (
                <PackageItem key={index} subscription={s} />
              ))
            ) : (
              <NoActivePackageBox />
            )}
          </div>
          {expiredSubscriptions && expiredSubscriptions.length > 0 && (
            <>
              <h2 className="mt-2 mb-6 text-subheading font-semibold text-black">
                {t('myPackagesPage.expired')}
              </h2>
              <div className="2xl:flex 2xl:flex-row 2xl:flex-wrap 2xl:items-center 2xl:justify-between">
                {expiredSubscriptions.map((s, index) => (
                  <PackageItem key={index} subscription={s} expired={true} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </Layout>
  );
}

export default MyPackagesPage;
