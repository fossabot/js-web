import { useMemo } from 'react';
import Head from 'next/head';
import Layout from '../layouts/main.layout';
import MainNavbar from '../ui-kit/headers/MainNavbar';
import useTranslation from '../i18n/useTranslation';
import TopNavbar from './components/TopNavbar';
import { DatePickerCalendar } from '../ui-kit/DatePicker/DatePickerCalendar';
import { DatePickerNavBar } from './components/DatePickerNavBar';
import { format, isToday, startOfDay } from 'date-fns';
import { useDashboardBookingsPage } from './useDashboardBookingsPage';
import { groupBy, transform } from 'lodash';
import { CourseSessionCard } from './components/CourseSessionCard';
import {
  Check,
  FaceToFace,
  FaceToFaceGray,
  Virtual,
  VirtualGray,
} from '../ui-kit/icons';
import cx from 'classnames';
import { CourseSubCategoryKey } from '../models/course';
import Link from 'next/link';
import WEB_PATHS from '../constants/webPaths';
import { FadeMessage } from '../ui-kit/FadeMessage';
import Picture from '../ui-kit/Picture';

function DashboardBookingsPage({ token }) {
  const { t } = useTranslation();

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {t('dashboardBookingsPage.metaTitle')}
        </title>
      </Head>
    ),
    [],
  );
  const {
    date,
    bookings,
    isAllowDate,
    minBookingDate,
    maxBookingDate,
    loading,
    infoNotiMessage,
    handleChangeDate,
  } = useDashboardBookingsPage();
  const bookingsByDay = groupBy(bookings, (booking) =>
    startOfDay(new Date(booking.startDateTime)).toJSON(),
  );
  const isAllVirtual =
    bookings.length > 0 &&
    bookings.every(
      (booking) =>
        booking.courseOutline.category.key === CourseSubCategoryKey.VIRTUAL,
    );
  const isAllF2F =
    bookings.length > 0 &&
    bookings.every(
      (booking) =>
        booking.courseOutline.category.key ===
        CourseSubCategoryKey.FACE_TO_FACE,
    );
  const isAllLearningStyles = !isAllVirtual && !isAllF2F;

  if (loading) {
    return (
      <Layout
        head={head}
        header={<MainNavbar token={token} />}
        noMobilePadding={true}
      >
        <TopNavbar />
      </Layout>
    );
  }

  return (
    <Layout
      head={head}
      header={<MainNavbar token={token} />}
      noMobilePadding={true}
      topContent={
        <div className="sticky left-0 top-16 z-40">
          <TopNavbar />
          <DatePickerNavBar
            className="lg:hidden"
            title={
              <div className="text-body font-semibold">
                <span>{format(minBookingDate(), 'E') + ' - '}</span>
                <span className="uppercase">
                  {format(maxBookingDate(), 'd MMM yy')}
                </span>
              </div>
            }
          >
            <DatePickerCalendar
              startDate={date}
              onChangeStartDate={handleChangeDate}
              allowedDates={isAllowDate}
              placement="auto"
              changeCalendarBy="month"
              style={{}}
            />
          </DatePickerNavBar>
        </div>
      }
    >
      {infoNotiMessage && (
        <div className="sticky top-16 z-10 mx-6 max-h-0 lg:top-36 lg:mx-auto lg:min-w-256">
          <FadeMessage type="success" title={infoNotiMessage} hasClose />
        </div>
      )}
      <div className="p-6 lg:mx-auto lg:flex lg:min-w-256 lg:space-x-8">
        <aside className="hidden lg:sticky lg:top-36 lg:block lg:space-y-8 lg:self-start">
          <DatePickerCalendar
            startDate={date}
            onChangeStartDate={handleChangeDate}
            allowedDates={isAllowDate}
            placement="auto"
            changeCalendarBy="month"
            style={{}}
            size="small"
            classNames={{ grid: 'gap-2' }}
          />
          <section className="space-y-8 rounded-xl border p-4">
            <div
              className={cx(
                'flex items-center justify-between font-semibold',
                isAllLearningStyles ? 'text-brand-primary' : 'text-gray-650',
              )}
            >
              <span>{t('dashboardBookingsPage.allLearningStyles')}</span>
              <Check className={cx({ hidden: !isAllLearningStyles })} />
            </div>
            <div
              className={cx(
                'flex items-center justify-between font-semibold',
                isAllVirtual ? 'text-brand-primary' : 'text-gray-650',
              )}
            >
              <div className="flex items-center space-x-3">
                {isAllVirtual ? <Virtual /> : <VirtualGray />}
                <span>{t('dashboardBookingsPage.virtual')}</span>
              </div>
              <Check className={cx({ hidden: !isAllVirtual })} />
            </div>
            <div
              className={cx(
                'flex items-center justify-between font-semibold',
                isAllF2F ? 'text-brand-primary' : 'text-gray-650',
              )}
            >
              <div className="flex items-center space-x-3">
                {isAllF2F ? <FaceToFace /> : <FaceToFaceGray />}
                <span>{t('dashboardBookingsPage.faceToFace')}</span>
              </div>
              <Check className={cx({ hidden: !isAllF2F })} />
            </div>
          </section>
        </aside>
        {bookings.length > 0 ? (
          <section className="space-y-12 lg:w-full">
            {transform(
              bookingsByDay,
              (result, sessions, key) =>
                result.push(
                  <div id={key} key={key} className="space-y-6">
                    <div>
                      {isToday(new Date(key)) && (
                        <div className="mb-1 text-gray-500">
                          {t('dashboardBookingsPage.today')}
                        </div>
                      )}
                      <div className="text-subtitle font-semibold">
                        {format(new Date(key), 'EEEE d MMMM yyyy')}
                      </div>
                    </div>
                    {sessions.map((session) => (
                      <CourseSessionCard key={session.id} session={session} />
                    ))}
                  </div>,
                ),
              [],
            )}
          </section>
        ) : (
          <section className="w-full">
            <div className="flex flex-col place-items-center rounded-3xl border border-gray-200 bg-gray-100 p-6">
              <Picture
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
              <div className="text-center text-heading font-semibold">
                {t('dashboardBookingsPage.noSessionAvailable')}
              </div>
              <div className="mt-2 text-center text-body text-gray-500">
                {t('dashboardBookingsPage.exploreEvents')}
              </div>
              <Link href={WEB_PATHS.EVENT_CALENDAR}>
                <a>
                  <div className="mt-4 text-center font-semibold text-brand-primary">
                    {t('dashboardBookingsPage.findACourseToEnroll')}
                  </div>
                </a>
              </Link>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

export default DashboardBookingsPage;
