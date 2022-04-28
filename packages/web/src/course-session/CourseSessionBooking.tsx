import cx from 'classnames';
import { isAfter } from 'date-fns';
import useTranslation from '../i18n/useTranslation';
import {
  CourseSubCategoryKey,
  ICourseSession,
  ICourseSessionInstructor,
} from '../models/course';
import {
  ArrowRight,
  Check,
  DoorOpen,
  FaceToFaceGray,
  SoundUp,
  VirtualGray,
} from '../ui-kit/icons';
import { ProfilePic } from '../ui-kit/ProfilePic';
import { getInstructorName } from './getInstructorName';

export interface ICourseSessionBookingProps {
  session: ICourseSession;
  handleBookCourseSession: (session: ICourseSession) => void;
  category: CourseSubCategoryKey;
}

export const CourseSessionBooking = ({
  session,
  handleBookCourseSession,
  category,
}: ICourseSessionBookingProps) => {
  const { t } = useTranslation();
  const instructor = (session.instructors[0] ||
    null) as ICourseSessionInstructor | null;

  const hasAlreadyStarted = isAfter(
    new Date(),
    new Date(session.startDateTime),
  );
  const hasSeats = session.availableSeats > 0 && !hasAlreadyStarted;

  return (
    <div
      className={cx('rounded-2xl border p-4', {
        'border-gray-200 bg-white': hasSeats && !session.isBooked,
        'border-gray-200 bg-gray-100': hasSeats && session.isBooked,
        'border-gray-300 bg-gray-200': !hasSeats,
      })}
    >
      <div
        className={cx(
          'space-between flex items-center space-x-2 border-b pb-4',
          {
            'border-gray-200': hasSeats,
            'border-gray-300': !hasSeats,
          },
        )}
      >
        <div className="flex flex-1 items-center space-x-2 truncate">
          <ProfilePic
            className="h-12 w-12 text-gray-300"
            imageKey={instructor?.profileImageKey}
          />
          <div className="truncate">
            <div className="truncate font-semibold">
              {getInstructorName(instructor, t)}
            </div>
            <div className="flex items-center space-x-1">
              {category === CourseSubCategoryKey.VIRTUAL && <VirtualGray />}
              {category === CourseSubCategoryKey.FACE_TO_FACE && (
                <FaceToFaceGray />
              )}
              <span className="text-footnote font-semibold text-gray-500">
                {category === CourseSubCategoryKey.VIRTUAL &&
                  `${t('courseDetailPage.virtual')} - ${session.webinarTool}`}
                {category === CourseSubCategoryKey.FACE_TO_FACE &&
                  t('courseDetailPage.faceToFace')}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4">
        {session.availableSeats < 20 ? (
          <div
            className={cx('flex items-center space-x-2', {
              'text-gray-650': hasSeats,
              'text-gray-400': !hasSeats,
            })}
          >
            <DoorOpen keepColor={hasSeats} />
            <span className="text-caption font-semibold">
              {hasSeats
                ? `${session.availableSeats} ${t(
                    'courseSessionsPage.seatsAvailable',
                  )}`
                : hasAlreadyStarted
                ? t('courseSessionsPage.alreadyStarted')
                : t('courseSessionsPage.noRemainingSeats')}
            </span>
          </div>
        ) : (
          // placeholder for justify between
          <div />
        )}

        {hasSeats &&
          (session.isBooked ? (
            <div className="flex items-center space-x-2 text-green-200">
              <Check />
              <span className="font-semibold">
                {t('courseSessionsPage.booked')}
              </span>
            </div>
          ) : (
            <button
              className="flex items-center space-x-2 text-brand-primary"
              onClick={() => handleBookCourseSession(session)}
            >
              <span className="font-semibold">
                {t('courseSessionsPage.book')}
              </span>
              <ArrowRight />
            </button>
          ))}
      </div>
    </div>
  );
};
