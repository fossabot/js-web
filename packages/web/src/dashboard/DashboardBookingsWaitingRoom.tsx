import { FC, useMemo } from 'react';
import Layout from '../layouts/main.layout';
import MainNavbar from '../ui-kit/headers/MainNavbar';
import useTranslation from '../i18n/useTranslation';
import TopNavbar from './components/TopNavbar';
import Head from 'next/head';
import { useDashboardBookingsWaitingRoom } from './useDashboardBookingsWaitingRoom';
import {
  ArrowRight,
  Calendar,
  DoorClosed,
  DoorOpen,
  Location,
  VirtualGray,
} from '../ui-kit/icons';
import { useCourseSessionDateTime } from './useCourseSessionDateTime';
import SessionRules from '../booking/session/SessionRules';
import { useLocaleText } from '../i18n/useLocaleText';
import { ProfilePic } from '../ui-kit/ProfilePic';
import { format } from 'date-fns';
import cx from 'classnames';
import Button from '../ui-kit/Button';
import { CourseSubCategoryKey } from '../models/course';
import Link from 'next/link';
import WEB_PATHS from '../constants/webPaths';
import { ConfirmCancelBookingModal } from './components/ConfirmCancelBookingModal';
import CancelPrivateSessionModal from './components/CancelPrivateSessionModal';
import { useModal } from '../ui-kit/Modal';
import useTimeout from 'use-timeout';

const DashboardBookingWaitingRoom: FC<any> = ({ token }) => {
  const { t } = useTranslation();
  const localeText = useLocaleText();
  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {t('dashboardBookingsWaitingRoom.metaTitle')}
        </title>
      </Head>
    ),
    [],
  );
  const {
    sessionBooking,
    handleCancelBooking,
    downloadIcs,
    setSessionState,
    validateCancelBooking,
    modalData,
    canceling,
  } = useDashboardBookingsWaitingRoom();
  const session = sessionBooking?.session;
  const outline = sessionBooking?.outline;
  const preRequisiteCourseId = sessionBooking?.preRequisiteCourseId;
  const {
    isEnded,
    isSoon,
    inProgress,
    willStart,
    startAt,
    endAt,
    willStartRemainingSeconds,
    soonRemainingSeconds,
    inProgressRemainingSeconds,
  } = useCourseSessionDateTime(
    new Date(session?.startDateTime),
    new Date(session?.endDateTime),
  );
  const ConfirmCancelModal = useModal();
  const CancelPrivateModal = useModal();
  const durationPaddingMs = 1000; // to make sure it hits in the range
  useTimeout(
    () => setSessionState('soon'),
    durationPaddingMs + willStartRemainingSeconds() * 1000,
  );
  useTimeout(
    () => setSessionState('inProgress'),
    durationPaddingMs + soonRemainingSeconds() * 1000,
  );
  useTimeout(
    () => setSessionState('ended'),
    durationPaddingMs + inProgressRemainingSeconds() * 1000,
  );

  return (
    <Layout
      head={head}
      header={<MainNavbar token={token} />}
      noMobilePadding={true}
      topContent={<TopNavbar />}
    >
      {sessionBooking && (
        <div className="lg:mx-auto">
          <div
            className={cx(
              'sticky top-15 flex items-center space-x-2 p-4 lg:static lg:mx-20 lg:mt-6 lg:rounded-2xl',
              !preRequisiteCourseId && (isSoon || inProgress)
                ? 'bg-brand-primary'
                : 'border border-gray-200 bg-gray-100',
            )}
          >
            {!preRequisiteCourseId && (
              <>
                {isEnded && (
                  <>
                    <DoorClosed className="text-gray-500" />
                    <span className="font-semibold text-gray-650">
                      {t('dashboardBookingsWaitingRoom.sessionEnd')}
                    </span>
                  </>
                )}
                {(isSoon || inProgress) && (
                  <div className="flex w-full justify-between">
                    <div className="flex w-full items-center space-x-2">
                      <div className="rounded-full bg-maroon-600 p-2 text-white">
                        <DoorOpen keepColor={false} />
                      </div>
                      <span className="text-caption font-semibold text-white lg:text-body">
                        {isSoon &&
                          t('dashboardBookingsWaitingRoom.sessionStartSoon')}
                        {inProgress &&
                          t('dashboardBookingsWaitingRoom.sessionInProgress')}
                      </span>
                    </div>
                    <div
                      className={cx('flex items-center justify-between', {
                        hidden:
                          outline.category.key ===
                          CourseSubCategoryKey.FACE_TO_FACE,
                      })}
                    >
                      <a
                        href={session.participantUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="w-32">
                          <Button variant="secondary" className="py-2 px-3">
                            <div className="flex items-center space-x-2 font-semibold text-brand-primary">
                              <span>
                                {t('dashboardBookingsWaitingRoom.joinNow')}
                              </span>
                              <ArrowRight />
                            </div>
                          </Button>
                        </div>
                      </a>
                    </div>
                  </div>
                )}
                {willStart && (
                  <>
                    <div className="rounded-full bg-gray-200 p-2 text-gray-300">
                      <DoorOpen keepColor={false} />
                    </div>
                    <span className="font-semibold text-gray-650">
                      {t('dashboardBookingsWaitingRoom.sessionNotStart')}
                    </span>
                  </>
                )}
              </>
            )}
            {!!preRequisiteCourseId && (
              <div className="flex w-full justify-between">
                <div className="flex w-full items-center space-x-2">
                  <div className="rounded-full bg-gray-200 p-2 text-gray-300">
                    <DoorOpen keepColor={false} />
                  </div>
                  <span className="text-caption font-semibold text-gray-650 lg:text-body">
                    {t(
                      'dashboardBookingsWaitingRoom.needToLearnPrerequisiteCourses',
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Link
                    href={WEB_PATHS.COURSE_DETAIL.replace(
                      ':id',
                      preRequisiteCourseId,
                    )}
                  >
                    <a>
                      <div className="w-48">
                        <Button variant="secondary" className="py-2 px-3">
                          <div className="flex items-center space-x-2 font-semibold text-brand-primary">
                            <span>
                              {t('dashboardBookingsWaitingRoom.takeMeThere')}
                            </span>
                            <ArrowRight />
                          </div>
                        </Button>
                      </div>
                    </a>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="m-4 space-y-4 lg:my-6 lg:mx-20 lg:flex lg:space-x-8 lg:space-y-0">
            <section className="lg:w-1/2">
              <div className="rounded-2xl border border-gray-200 bg-gray-100 p-6">
                <div className="text-heading font-semibold">
                  {localeText(outline.title)}
                </div>
                <div className="mt-3 flex items-stretch font-semibold text-brand-primary">
                  <Link
                    href={WEB_PATHS.COURSE_DETAIL.replace(
                      ':id',
                      sessionBooking.courseId,
                    )}
                  >
                    <a className="flex items-center space-x-2">
                      <span>
                        {t('dashboardBookingsWaitingRoom.viewCourseDetails')}
                      </span>
                      <ArrowRight />
                    </a>
                  </Link>
                </div>
                <div className="mt-4 border-b text-gray-200" />
                <div className="mt-3 flex items-center space-x-2">
                  <ProfilePic
                    className="h-12 w-12 text-gray-300"
                    imageKey={session.instructors[0]?.profileImageKey}
                  />
                  <div>
                    <span className="text-heading font-semibold">
                      {session.instructors[0]?.firstName}{' '}
                      {session.instructors[0]?.lastName}
                    </span>
                    <div className="flex items-center space-x-1 font-semibold text-gray-500">
                      {outline.category.key ===
                        CourseSubCategoryKey.VIRTUAL && (
                        <>
                          <VirtualGray />
                          <span>
                            {outline.category.name} - {session.webinarTool}
                          </span>
                        </>
                      )}
                      {outline.category.key ===
                        CourseSubCategoryKey.FACE_TO_FACE && (
                        <>
                          <Location />
                          <span>{session.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 border-b text-gray-200" />
                <div className="lg:mt-3 lg:flex lg:items-center lg:justify-between">
                  <div className="mt-4 text-subheading font-semibold lg:mt-0">
                    <span>{format(startAt, 'EEEE')} - </span>
                    <span className="uppercase">
                      {format(endAt, 'd MMM yy')}
                    </span>
                  </div>
                  <div className="mt-1 text-subheading font-semibold lg:mt-0">
                    <span>{format(startAt, 'H:mm')} - </span>
                    <span className="uppercase">{format(endAt, 'H:mm')}</span>
                  </div>
                </div>
                <a onClick={downloadIcs}>
                  <div className="mt-2 flex items-center space-x-1">
                    <Calendar />
                    <span className="font-semibold text-gray-500">
                      {t('dashboardBookingsWaitingRoom.addToCalendar')}
                    </span>
                  </div>
                </a>
                {willStart && (
                  <>
                    <div className="mt-6 border-b text-gray-200" />
                    <div
                      className="mt-6 cursor-pointer text-right text-caption font-semibold text-gray-500"
                      onClick={async () => {
                        if (session.isPrivate) {
                          CancelPrivateModal.toggle();
                        } else {
                          await validateCancelBooking();
                          ConfirmCancelModal.toggle();
                        }
                      }}
                    >
                      {t('dashboardBookingsWaitingRoom.cancelThisBooking')}
                    </div>
                    <ConfirmCancelBookingModal
                      isOpen={ConfirmCancelModal.isOpen}
                      toggle={ConfirmCancelModal.toggle}
                      modalData={modalData}
                      onOk={handleCancelBooking}
                      loading={canceling}
                      outline={outline}
                    />
                    <CancelPrivateSessionModal
                      isOpen={CancelPrivateModal.isOpen}
                      toggle={CancelPrivateModal.toggle}
                    />
                  </>
                )}
              </div>
            </section>
            <section className="rounded-2xl border border-gray-200 bg-gray-100 p-6 lg:w-1/2">
              <SessionRules />
            </section>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DashboardBookingWaitingRoom;
