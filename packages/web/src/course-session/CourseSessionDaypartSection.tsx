import cx from 'classnames';
import format from 'date-fns/format';
import { FC, useMemo } from 'react';
import { CourseSubCategoryKey, ICourseSession } from '../models/course';
import { CourseSessionBooking } from './CourseSessionBooking';

interface ICourseSessionDaypartSection {
  title: string;
  icon: FC<{ className: string }>;
  sessions: ICourseSession[];
  index: number;
  handleBookCourseSession: (session: ICourseSession) => void;
  category: CourseSubCategoryKey;
}

interface ITimeSlot {
  sessions: ICourseSession[];
  startTime: string;
  endTime: string;
}

export const CourseSessionDaypartSection = ({
  title,
  icon,
  sessions,
  index,
  category,
  handleBookCourseSession,
}: ICourseSessionDaypartSection) => {
  const Icon = icon;

  const timeSlots = useMemo<ITimeSlot[]>(() => {
    const timeSlots: {
      [timeSlot: string]: ICourseSession[];
    } = {};
    for (const session of sessions) {
      const startTime = new Date(session.startDateTime);
      const endTime = new Date(session.endDateTime);
      const timeSlot = `${format(startTime, 'HH:mm')}-${format(
        endTime,
        'HH:mm',
      )}`;
      if (timeSlots[timeSlot] === undefined) {
        timeSlots[timeSlot] = [];
      }
      timeSlots[timeSlot].push(session);
    }

    return Object.keys(timeSlots)
      .sort()
      .map((timeSlot) => {
        const [startTime, endTime] = timeSlot.split('-');
        return {
          startTime,
          endTime,
          sessions: timeSlots[timeSlot],
        };
      });
  }, [sessions]);

  return (
    <div
      id={title.toLowerCase()}
      className={cx(
        'border-b border-gray-200 bg-gray-100 p-7 lg:rounded-2xl lg:border lg:p-6',
        { 'border-t': index !== 0 },
      )}
    >
      <div className="flex items-center space-x-3">
        <Icon className="text-gray-500" />
        <span className="text-subheading font-medium text-gray-650">
          {title}
        </span>
      </div>
      {timeSlots.map((section) => (
        <div key={section.startTime} className="mt-6 block lg:flex">
          <div className="hidden w-20 lg:block">
            <h3 className="text-title-desktop font-medium">
              {section.startTime}
            </h3>
            <h6 className="text-subheading text-gray-500">{section.endTime}</h6>
          </div>
          <h3 className="block text-title-desktop font-medium lg:hidden">
            {section.startTime} - {section.endTime}
          </h3>

          <div className="mt-4 grid flex-1 grid-cols-1 gap-4 lg:mt-0 lg:ml-10 lg:grid-cols-2">
            {section.sessions.map((session) => (
              <CourseSessionBooking
                key={session.id}
                session={session}
                handleBookCourseSession={handleBookCourseSession}
                category={category}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
