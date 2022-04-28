import cx from 'classnames';
import { format } from 'date-fns';
import Link from 'next/link';
import { FC } from 'react';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';
import { CourseSubCategoryKey, ICourseSession } from '../../models/course';
import { Reason } from '../../models/userCourseSessionCancellationLog';
import Button from '../../ui-kit/Button';
import {
  ArrowRight,
  BadgeCheck,
  DoorClosed,
  FaceToFaceGray,
  SoundUpGray,
  VirtualGray,
} from '../../ui-kit/icons';
import Picture from '../../ui-kit/Picture';
import { ProfilePic } from '../../ui-kit/ProfilePic';
import { useCourseSessionDateTime } from '../useCourseSessionDateTime';

export interface ICourseSessionCard {
  session: ICourseSession & { cancelReason?: Reason };
}

export const CourseSessionCard: FC<ICourseSessionCard> = (props) => {
  const { t } = useTranslation();
  const { session } = props;
  const {
    startDateTime,
    endDateTime,
    courseOutline,
    instructors,
    sessionBookings,
    cancelReason,
  } = session;

  const { isEnded, joinable, willStart, startAt, endAt } =
    useCourseSessionDateTime(new Date(startDateTime), new Date(endDateTime));

  function mapReason(reason: Reason): string {
    return {
      [Reason.CancelledByAdmin]: t('dashboardBookingsPage.cancelledBySEAC'),
      [Reason.CancelledByUser]: t('dashboardBookingsPage.cancelledByUser'),
      [Reason.CancelledSession]: t('dashboardBookingsPage.sessionCancelled'),
    }[reason];
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-gray-100 p-6 hover:shadow lg:flex lg:space-x-8">
      <section className="flex items-center space-x-2 lg:block lg:space-x-0 lg:text-right">
        <div className="text-title-desktop font-bold">
          {format(startAt, 'H:mm')}
        </div>
        <div className="text-body text-gray-500">{format(endAt, 'H:mm')}</div>
      </section>
      <div className="lg:w-full">
        <section className="flex justify-between">
          <div>
            <div className="mt-1 text-subheading font-bold">
              {courseOutline.title}
            </div>
            <div className="mt-1 text-gray-500">
              {courseOutline.course.title}
            </div>
          </div>
          {!courseOutline.course.imageKey ? (
            <Picture
              className="w-20 rounded-2xl object-cover "
              sources={[
                {
                  srcSet: '/assets/course/course-default.webp',
                  type: 'image/webp',
                },
              ]}
              fallbackImage={{ src: '/assets/course/course-default.png' }}
            />
          ) : (
            <img
              className="w-20 rounded-2xl object-cover"
              alt={courseOutline.course.title}
              src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${courseOutline.course.imageKey}`}
            />
          )}
        </section>
        <section className="mt-6 flex space-x-2 text-gray-500">
          <div className="flex items-center space-x-1 text-footnote font-semibold">
            {courseOutline.category.key ===
              CourseSubCategoryKey.FACE_TO_FACE && (
              <>
                <FaceToFaceGray />
                <span>{courseOutline.category.name}</span>
              </>
            )}
            {courseOutline.category.key === CourseSubCategoryKey.VIRTUAL && (
              <>
                <VirtualGray />
                <span>
                  {courseOutline.category.name} - {session.webinarTool}
                </span>
              </>
            )}
          </div>
          <div>|</div>
          <div className="flex items-center space-x-1">
            <span className="text-footnote font-semibold">
              {courseOutline.learningWay.name}
            </span>
          </div>
          <div>|</div>
          <div
            className={cx('flex items-center space-x-1', {
              hidden: !courseOutline.course.hasCertificate,
            })}
          >
            <BadgeCheck className="text-gray-500" />
            <span className="text-footnote font-semibold">Certificate</span>
          </div>
          <div className={cx({ hidden: !courseOutline.course.hasCertificate })}>
            |
          </div>
          <div className="flex items-center space-x-1">
            <SoundUpGray width={16} height={16} />
            <span className="text-footnote font-semibold uppercase">
              {courseOutline.course.availableLanguage}
            </span>
          </div>
        </section>
        <div className="mt-4 border-b border-gray-200" />
        <section className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ProfilePic
              imageKey={instructors[0]?.profileImageKey}
              className="h-8 w-8 text-body text-gray-300"
            />
            <div className="text-gray-650">
              {instructors[0]?.firstName} {instructors[0]?.lastName}
            </div>
          </div>
          {cancelReason ? (
            <div className="flex space-x-5">
              <span className="font-semibold text-gray-500">
                {mapReason(cancelReason)}
              </span>
              <Link
                href={WEB_PATHS.COURSE_OUTLINE_SESSIONS.replace(
                  ':id',
                  courseOutline.id,
                )}
              >
                <a>
                  <div className="flex items-center space-x-2 font-semibold text-brand-primary">
                    <span>{t('dashboardBookingsPage.findTime')}</span>
                    <ArrowRight />
                  </div>
                </a>
              </Link>
            </div>
          ) : (
            <>
              {isEnded && (
                <div className="flex items-center space-x-1 font-semibold text-gray-400">
                  <DoorClosed />
                  <span>{t('dashboardBookingsPage.completed')}</span>
                </div>
              )}
              {joinable && (
                <Link
                  href={WEB_PATHS.DASHBOARD_BOOKINGS_WAITING_ROOM.replace(
                    ':id',
                    sessionBookings[0].id,
                  )}
                >
                  <a>
                    <Button
                      variant="primary"
                      type="button"
                      className="space-x-2 px-5 py-2"
                    >
                      <div>{t('dashboardBookingsPage.join')}</div>
                      <ArrowRight />
                    </Button>
                  </a>
                </Link>
              )}
              {willStart && (
                <Link
                  href={WEB_PATHS.DASHBOARD_BOOKINGS_WAITING_ROOM.replace(
                    ':id',
                    sessionBookings[0].id,
                  )}
                >
                  <a className="font-semibold text-brand-primary">
                    {t('dashboardBookingsPage.details')}
                  </a>
                </Link>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};
