import cx from 'classnames';
import { format, isAfter, isBefore } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CSSProperties, useMemo } from 'react';
import WEB_PATHS from '../../constants/webPaths';
import { CourseSubCategoryKey } from '../../models/course';
import { User } from '../../models/user';
import { FaceToFaceGray, Person, VirtualGray } from '../../ui-kit/icons';
import { ProfilePic } from '../../ui-kit/ProfilePic';
import {
  ISessionManagementCourseOutline,
  SessionStatus,
} from './useSessionList';

interface ISessionItem {
  session: ISessionManagementCourseOutline['courseSessions'][number];
  subCategory: CourseSubCategoryKey;
  instructorsMap: { [userId: string]: User };
}

const iconStyle: CSSProperties = { height: '0.875rem', width: '0.875rem' };

export const SessionItem = ({
  session,
  subCategory,
  instructorsMap,
}: ISessionItem) => {
  const router = useRouter();
  const startTime = useMemo<Date>(
    () => new Date(session.startTime),
    [session.startTime],
  );
  const endTime = useMemo<Date>(
    () => new Date(session.endTime),
    [session.endTime],
  );

  const instructor = useMemo<User | null>(() => {
    const instructorId = router.query.instructorId
      ? String(router.query.instructorId)
      : session.instructorIds[0];

    if (instructorId) {
      return instructorsMap[instructorId] || null;
    }
    return null;
  }, [router.query, instructorsMap, session.instructorIds]);

  const status = useMemo<SessionStatus | null>(() => {
    const now = new Date();

    if (session.cancelled) return SessionStatus.CANCELLED;
    if (isBefore(now, startTime)) return SessionStatus.NOT_STARTED;
    if (isAfter(now, startTime) && isBefore(now, endTime))
      return SessionStatus.IN_PROGRESS;
    if (isAfter(now, startTime) && isAfter(now, endTime))
      return SessionStatus.COMPLETED;
    return null;
  }, [endTime, session.cancelled, startTime]);

  const sessionDetailUrl = useMemo(
    () => WEB_PATHS.SESSION_PARTICIPANTS_MANAGEMENT.replace(':id', session?.id),
    [session?.id],
  );

  return (
    <Link href={sessionDetailUrl}>
      <a className="rounded-2xl border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <span className="text-caption font-semibold text-black">
            {format(startTime, 'dd MMM yy').toUpperCase()}
          </span>
          {status && (
            <div
              style={{ padding: '0.125rem 0.625rem', borderRadius: '0.625rem' }}
              className={cx('text-footnote font-semibold', {
                'bg-gray-200 text-black': status === SessionStatus.NOT_STARTED,
                'text-yellow-800 bg-yellow-100':
                  status === SessionStatus.IN_PROGRESS,
                'text-green-800 bg-green-100':
                  status === SessionStatus.COMPLETED,
                'bg-gray-200 text-gray-400': status === SessionStatus.CANCELLED,
              })}
            >
              {status === SessionStatus.NOT_STARTED && 'Not started'}
              {status === SessionStatus.IN_PROGRESS && 'In progress'}
              {status === SessionStatus.COMPLETED && 'Completed'}
              {status === SessionStatus.CANCELLED && 'Cancelled'}
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center space-x-1 text-footnote text-gray-500">
          {subCategory === CourseSubCategoryKey.FACE_TO_FACE ? (
            <>
              <FaceToFaceGray style={iconStyle} />
              <span>F2F</span>
            </>
          ) : (
            <>
              <VirtualGray style={iconStyle} />
              <span>Virtual</span>
            </>
          )}
          <div className="w-px self-stretch bg-gray-200" />
          <span>
            {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
          </span>
        </div>
        <div className="mt-2 flex items-center space-x-1 text-footnote text-gray-500">
          <Person style={iconStyle} />
          <span>
            {session.booked}/{session.seats}
          </span>

          {session.booked >= session.seats && (
            <span className="font-semibold text-red-200">Fully booked</span>
          )}
        </div>
        {instructor && (
          <div className="mt-2 flex items-center space-x-2 border-t border-gray-200 pt-2">
            <ProfilePic
              className="h-6 min-h-6 w-6 text-gray-300"
              imageKey={instructor.profileImageKey}
            />
            <div className="truncate text-caption text-gray-650">
              {instructor.firstName} {instructor.lastName}
            </div>
          </div>
        )}
      </a>
    </Link>
  );
};
