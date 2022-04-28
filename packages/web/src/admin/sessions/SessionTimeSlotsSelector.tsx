import cx from 'classnames';
import Link from 'next/link';
import { truncate } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from '../../ui-kit/icons';
import PerfectScroll from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { CourseSessionOverview } from '../../models/course-session';
import { ICourseSession } from '../../models/course';
import WEB_PATHS from '../../constants/webPaths';
import CourseSubCategoryIcon from './CourseSubCategoryIcon';
import { format } from 'date-fns';

const INSTRUCTOR_NAME_LENGTH = 12;

interface ISessionTimeSlots {
  currentSessionId: string;
  relatedCourseSessions: ICourseSession[];
  onClickTimeSlot: () => void;
}

function SessionTimeSlots({
  currentSessionId,
  relatedCourseSessions,
  onClickTimeSlot,
}: ISessionTimeSlots) {
  return (
    <div className="absolute left-0 top-full z-10 mt-3 h-85 w-full bg-white p-3 shadow">
      <PerfectScroll>
        <div className="flex flex-wrap gap-3">
          {relatedCourseSessions.map((session) => (
            <SessionTimeSlotItem
              key={session.id}
              session={session}
              isCurrentSession={session.id === currentSessionId}
              onClickTimeSlot={onClickTimeSlot}
            />
          ))}
        </div>
      </PerfectScroll>
    </div>
  );
}

interface ISessionTimeSlotItem {
  session: ICourseSession;
  isCurrentSession: boolean;
  onClickTimeSlot: () => void;
}

function SessionTimeSlotItem({
  session,
  isCurrentSession,
  onClickTimeSlot,
}: ISessionTimeSlotItem) {
  const [isHover, setIsHover] = useState(isCurrentSession);

  const instructorName = useMemo(() => {
    if (session.instructors?.length) {
      const fullName = `${session.instructors[0].firstName} ${session.instructors[0].lastName}`;
      return truncate(fullName, { length: INSTRUCTOR_NAME_LENGTH });
    } else {
      return '';
    }
  }, [session.instructors?.length]);

  const startTime = useMemo(() => {
    if (session.startDateTime) {
      return format(new Date(session.startDateTime), 'HH:mm');
    } else {
      return '';
    }
  }, [session.startDateTime]);

  const endTime = useMemo(() => {
    if (session.endDateTime) {
      return format(new Date(session.endDateTime), 'HH:mm');
    } else {
      return '';
    }
  }, [session.endDateTime]);

  const isActive = useMemo(
    () => isCurrentSession || isHover,
    [isCurrentSession, isHover],
  );

  return (
    <Link
      key={session.id}
      href={WEB_PATHS.SESSION_PARTICIPANTS_MANAGEMENT.replace(
        ':id',
        session.id,
      )}
    >
      <a
        className={cx('select-none rounded-lg border px-3 py-2.5', {
          'border-gray-200': !isActive,
          'border-brand-primary': isActive,
        })}
        onClick={onClickTimeSlot}
        onMouseOver={() => setIsHover(true)}
        onMouseOut={() => setIsHover(false)}
      >
        <div className="mb-1 flex items-center space-x-1">
          <CourseSubCategoryIcon
            category={session.courseOutlineCategory.key}
            className="mr-1"
            enabledHoverState={true}
            isHover={isActive}
          />
          <div
            className={cx('whitespace-nowrap text-footnote font-semibold', {
              'text-black': !isActive,
              'text-brand-primary': isActive,
            })}
          >
            {startTime} - {endTime}
          </div>
        </div>
        <div
          className={cx('whitespace-nowrap text-footnote text-black', {
            'text-gray-500': !isActive,
            'text-black': isActive,
            'font-semibold': isCurrentSession,
          })}
        >
          {instructorName}
        </div>
      </a>
    </Link>
  );
}

interface ISessionTimeSlotSelector {
  currentSession: CourseSessionOverview;
  relatedCourseSessions: ICourseSession[];
}

function SessionTimeSlotSelector({
  currentSession,
  relatedCourseSessions,
}: ISessionTimeSlotSelector) {
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  function toggleTimeSlotDropDown() {
    setShowTimeSlots(!showTimeSlots);
  }

  function handleClickTimeSlot() {
    setShowTimeSlots(false);
  }

  function onClickBody(e: MouseEvent) {
    e.preventDefault();
    setShowTimeSlots(false);
  }

  useEffect(() => {
    if (showTimeSlots) {
      document.body.style.overflowY = 'hidden';
      document.body.addEventListener('click', onClickBody);
    }

    return () => {
      document.body.style.overflowY = 'initial';
      document.body.removeEventListener('click', onClickBody);
    };
  }, [showTimeSlots]);

  const startTime = useMemo(() => {
    if (currentSession.startDateTime) {
      return format(new Date(currentSession.startDateTime), 'HH:mm');
    } else {
      return '';
    }
  }, [currentSession.startDateTime]);

  const endTime = useMemo(() => {
    if (currentSession.endDateTime) {
      return format(new Date(currentSession.endDateTime), 'HH:mm');
    } else {
      return '';
    }
  }, [currentSession.endDateTime]);

  return (
    <div className="relative cursor-pointer">
      <div
        className="mt-4 flex items-center rounded-lg border border-gray-200 bg-white px-5 py-3"
        onClick={toggleTimeSlotDropDown}
      >
        <CourseSubCategoryIcon
          category={currentSession.courseSubCategoryKey}
          className="mr-3"
        />
        <div className="mr-3 border-r border-gray-200 pr-3">
          {startTime} - {endTime}
        </div>
        <div className="flex-1">{currentSession.instructorName}</div>
        <ChevronDown />
      </div>
      {showTimeSlots && (
        <SessionTimeSlots
          currentSessionId={currentSession.id}
          relatedCourseSessions={relatedCourseSessions}
          onClickTimeSlot={handleClickTimeSlot}
        />
      )}
    </div>
  );
}

export default SessionTimeSlotSelector;
