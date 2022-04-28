import cx from 'classnames';
import { sum } from 'lodash';
import Head from 'next/head';
import { useEffect, useMemo, useRef } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import useTranslation from '../i18n/useTranslation';
import Layout from '../layouts/main.layout';
import { CourseDiscoveryType } from '../models/course-discovery';
import MainNavbar from '../ui-kit/headers/MainNavbar';
import { ArrowRight, BarGraph, Hashtag, Sparkles } from '../ui-kit/icons';
import Picture from '../ui-kit/Picture';
import { AssignedRequiredItems } from './components/AssignedRequiredItems';
import { CourseGallerySkeleton } from './components/CourseGallerySkeleton';
import { DiscoverMore } from './components/DiscoverMore';
import { PromoBannerCarousel } from './components/PromoBannerCarousel';
import { PromoBannerCarouselSkeleton } from './components/PromoBannerCarouselSkeleton';
import { Stat } from './components/Stat';
import { StatSkeleton } from './components/StatSkeleton';
import TopNavbar from './components/TopNavbar';
import { UserCourseCard } from './components/UserCourseCard';
import { UserCourseCardSkeleton } from './components/UserCourseCardSkeleton';
import { useDashboardHomePage } from './useDashboardHomePage';

function DashboardPage({ token }) {
  const { t } = useTranslation();
  const {
    summaryResult,
    latestCourse,
    promoBanners,
    fetchCourseSummary,
    fetchLatestInProgressCourse,
    fetchPromoBanners,
    fetchCourseDiscovery,
    discoveryCourses,
    discoveryTab,
    setDiscoveryTab,
    showMoreDiscovery,
    setShowMoreDiscovery,
  } = useDashboardHomePage();
  const catalogMenuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const { lg } = useResponsive();

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {t('dashboardPage.metaTitle')}
        </title>
      </Head>
    ),
    [t],
  );

  function handleOnClickEnroll() {
    if (!lg) {
      hamburgerRef.current.click();
    }
    catalogMenuRef.current.children[0].click();
  }

  useEffect(() => {
    fetchCourseSummary();
    fetchLatestInProgressCourse();
    fetchPromoBanners();
    fetchCourseDiscovery();
  }, []);

  const renderDiscoveryTabItem =
    ({ activeIcon, inactiveIcon, text }) =>
    // eslint-disable-next-line react/display-name
    ({ active }: { active: boolean }) => {
      const ActiveIcon = activeIcon;
      const InactiveIcon = inactiveIcon;
      return (
        <div className="flex space-x-2">
          {active ? <ActiveIcon /> : <InactiveIcon />}
          <span className="text-caption">{text}</span>
        </div>
      );
    };

  return (
    <Layout
      head={head}
      header={
        <MainNavbar
          token={token}
          catalogMenuRef={catalogMenuRef}
          hamburgerRef={hamburgerRef}
        />
      }
      noMobilePadding={true}
      topContent={
        <div className="sticky left-0 top-16 z-40">
          <TopNavbar />
        </div>
      }
    >
      <div>
        <div className="lg:m-8 lg:mx-auto lg:flex lg:w-256 lg:items-center lg:space-x-12">
          {summaryResult ? (
            <Stat
              name={token.user.firstName}
              upoint={0}
              nTotalCourses={sum([
                summaryResult.notStarted,
                summaryResult.inProgress,
                summaryResult.completed,
              ])}
              nInProgress={summaryResult.inProgress}
              nCompleted={summaryResult.completed}
              nCertificate={summaryResult.certificate}
            />
          ) : (
            <StatSkeleton />
          )}
          <section className="lg:w-8/12">
            {latestCourse && (
              <UserCourseCard className="lg:h-full" course={latestCourse} />
            )}
            {latestCourse === null && (
              <div className="flex flex-col items-center justify-center bg-gray-100 p-6 lg:h-full lg:rounded-2xl lg:border lg:border-gray-200">
                <Picture
                  className="w-24 lg:w-32"
                  sources={[
                    {
                      srcSet: '/assets/empty.webp',
                      type: 'image/webp',
                    },
                  ]}
                  fallbackImage={{
                    src: '/assets/empty.png',
                  }}
                />
                <div className="mt-6 text-subheading font-semibold text-gray-650">
                  {t('dashboardHomePage.letsGetStarted')}
                </div>
                <div
                  className="mt-5 flex cursor-pointer items-center space-x-1 font-semibold text-brand-primary"
                  onClick={handleOnClickEnroll}
                >
                  <span>{t('dashboardHomePage.enrollNow')}</span>
                  <ArrowRight />
                </div>
              </div>
            )}
            {latestCourse === undefined && <UserCourseCardSkeleton />}
          </section>
        </div>
        {promoBanners ? (
          <div className={cx('mt-12', { 'mt-0': promoBanners.length <= 0 })}>
            <PromoBannerCarousel promoBanners={promoBanners} />
          </div>
        ) : (
          <div className="mt-12">
            <PromoBannerCarouselSkeleton />
          </div>
        )}
        <div className="lg:m-8 lg:mx-auto lg:w-256">
          <AssignedRequiredItems />
        </div>
        <div className="lg:m-8 lg:mx-auto lg:w-256">
          {discoveryCourses ? (
            <DiscoverMore
              activeTab={discoveryTab}
              onChangeTab={setDiscoveryTab}
              tabs={[
                {
                  key: CourseDiscoveryType.HIGHLIGHT,
                  render: renderDiscoveryTabItem({
                    activeIcon: Hashtag,
                    inactiveIcon: Hashtag,
                    text: t('dashboardHomePage.highlight'),
                  }),
                },
                {
                  key: CourseDiscoveryType.POPULAR,
                  render: renderDiscoveryTabItem({
                    activeIcon: BarGraph,
                    inactiveIcon: BarGraph,
                    text: t('dashboardHomePage.popular'),
                  }),
                },
                {
                  key: CourseDiscoveryType.NEW_RELEASE,
                  render: renderDiscoveryTabItem({
                    activeIcon: Sparkles,
                    inactiveIcon: Sparkles,
                    text: t('dashboardHomePage.newReleases'),
                  }),
                },
              ]}
              discoveryCourses={discoveryCourses}
              showMore={showMoreDiscovery}
              onShowMore={() => setShowMoreDiscovery((bool) => !bool)}
            />
          ) : (
            discoveryCourses === undefined && <CourseGallerySkeleton />
          )}
        </div>
        <div className="lg:m-8 lg:mx-auto lg:flex lg:w-256 lg:space-x-9">
          {/* TODO: Integrate skeleton with real component */}
          {/* <PopularTopicsSkeleton />
          <FeaturedInstructorsSkeleton /> */}
        </div>
      </div>
    </Layout>
  );
}

export default DashboardPage;
