import { format, isAfter } from 'date-fns';
import Link from 'next/link';
import WEB_PATHS from '../constants/webPaths';
import { CourseSessionToBook } from '../hooks/useBookSession';
import { useResponsive } from '../hooks/useResponsive';
import { useLocaleText } from '../i18n/useLocaleText';
import useTranslation from '../i18n/useTranslation';
import { CourseSubCategoryKey, ICourseSession } from '../models/course';
import Button from '../ui-kit/Button';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  DoorOpen,
  Location,
  SoundUp,
  VirtualGray,
} from '../ui-kit/icons';
import Picture from '../ui-kit/Picture';

type UpcomingSessionCardProps = {
  session: ICourseSession;
  handleBookCourseSession: (session: CourseSessionToBook) => Promise<void>;
};

export const UpcomingSessionCard = ({
  session,
  handleBookCourseSession,
}: UpcomingSessionCardProps) => {
  const { t } = useTranslation();
  const { lg } = useResponsive();
  const localeText = useLocaleText();

  const startTime = new Date(session.startDateTime);
  const endTime = new Date(session.endDateTime);

  const priorityTopic = session.courseTopics?.[0];

  const image = session.courseImageKey ? (
    <img
      className="h-16 w-16 rounded-2xl lg:h-22 lg:w-22"
      src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${session.courseImageKey}`}
      alt={localeText(session.courseOutlineTitle)}
    />
  ) : (
    <Picture
      className="h-16 w-16 rounded-2xl lg:h-22 lg:w-22"
      sources={[
        {
          srcSet: '/assets/course/course-default.webp',
          type: 'image/webp',
        },
      ]}
      fallbackImage={{ src: '/assets/course/course-default.png' }}
    />
  );

  const topicLabel = (
    <div className="text-caption font-semibold text-brand-primary">
      {priorityTopic?.name}
    </div>
  );

  const courseTitle = (
    <div className="font-semibold">{localeText(session.courseTitle)}</div>
  );

  const courseOutlineTitle = (
    <div className="text-caption text-gray-500">
      {localeText(session.courseOutlineTitle)}
    </div>
  );

  const learningWay = (
    <span className="pr-2 text-caption font-semibold text-gray-650">
      {session.courseOutlineLearningWay?.name}
    </span>
  );

  const time = (
    <div className="text-subtitle font-bold">
      {format(startTime, 'H:mm')} - {format(endTime, 'H:mm')}
    </div>
  );

  const category = (
    <>
      {session.courseOutlineCategory?.key ===
        CourseSubCategoryKey.FACE_TO_FACE &&
        session.location && (
          <div className="flex justify-end space-x-1">
            <Location className="text-gray-400" />
            <span className="text-footnote font-semibold text-gray-650">
              {session.location}
            </span>
          </div>
        )}
      {session.courseOutlineCategory?.key === CourseSubCategoryKey.VIRTUAL && (
        <div className="flex justify-end space-x-1">
          <VirtualGray className="text-gray-400" />
          <span className="text-footnote font-semibold text-gray-650">
            {t('eventCalendarPage.virtual')} - {session.webinarTool}
          </span>
        </div>
      )}
    </>
  );

  const language = session.language === 'en' && (
    <div className="flex items-center justify-end space-x-1 pl-2 text-caption font-semibold text-gray-650">
      <SoundUp />
      <span>EN</span>
    </div>
  );

  const certificate = session.hasCertificate ? (
    <div className="mr-2 flex flex-row items-center text-gray-650">
      <BadgeCheck className="ml-2 h-5 w-5" />
      <p className="ml-1 text-caption font-semibold">
        {t('eventCalendarPage.certificate')}
      </p>
    </div>
  ) : null;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6">
      {lg ? (
        <>
          <div className="flex space-x-4">
            {image}

            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                {topicLabel}
                {courseTitle}
                {courseOutlineTitle}
              </div>
            </div>
            <div className="flex flex-col justify-between space-y-2">
              <div className="space-y-2">
                {time}
                {category}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between">
            {image}
            <div>
              {time}
              {category}
            </div>
          </div>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              {topicLabel}
              {courseTitle}
              {courseOutlineTitle}
            </div>
            <div className="flex items-center divide-x divide-gray-650">
              {learningWay}
              {certificate}
              {language}
            </div>
          </div>
        </>
      )}
      <div className="my-4 h-1px w-full bg-gray-200" />
      <div className="flex justify-end lg:justify-between">
        <div className="hidden items-center divide-x divide-gray-650 lg:flex">
          {learningWay}
          {certificate}
          {language}
        </div>
        {session.isBooked ? (
          <div className="flex items-center space-x-2 text-green-200">
            <Check />
            <span className="font-semibold">
              {t('eventCalendarPage.booked')}
            </span>
          </div>
        ) : session.availableSeats === 0 && session.seats > 0 ? (
          <div className="flex items-center space-x-3">
            <span className="text-caption font-semibold text-gray-500">
              {t('eventCalendarPage.sessionFullyBooked')}
            </span>

            <Link
              href={WEB_PATHS.COURSE_OUTLINE_SESSIONS.replace(
                ':id',
                session.courseOutlineId,
              )}
            >
              <a className="flex items-center space-x-2 text-caption font-semibold text-brand-primary">
                <span>{t('eventCalendarPage.findTimes')}</span>
                <ArrowRight />
              </a>
            </Link>
          </div>
        ) : isAfter(new Date(), new Date(session.startDateTime)) ? (
          <div className="flex items-center space-x-2 font-semibold text-gray-400">
            <DoorOpen keepColor />
            <span>{t('eventCalendarPage.started')}</span>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-between space-x-4 lg:justify-end">
            {session.availableSeats < 20 ? (
              <span className="text-caption font-semibold text-gray-650">
                {session.availableSeats}{' '}
                {session.availableSeats === 1
                  ? t('eventCalendarPage.seatLeft')
                  : t('eventCalendarPage.seatsLeft')}
              </span>
            ) : (
              <div />
            )}
            <Button
              className="font-semibold"
              size="small"
              variant="primary"
              avoidFullWidth
              onClick={() => {
                handleBookCourseSession(session);
              }}
            >
              {t('eventCalendarPage.bookNow')} <ArrowRight className="ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
