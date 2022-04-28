import { CourseSessionToBook } from '../hooks/useBookSession';
import { useResponsive } from '../hooks/useResponsive';
import useTranslation from '../i18n/useTranslation';
import { ICourseSession } from '../models/course';
import { Afternoon, Evening, Morning } from '../ui-kit/icons';
import { DayPeriod, TopicFilter } from '../hooks/useSessionCalendar';
import { EventCalendarSession } from './EventCalendarSession';

interface IEventCalendarDayPeriodProps {
  dayPeriod: DayPeriod;
  sessions: ICourseSession[];
  topic: TopicFilter;
  instructorId: string | null;
  handleBookCourseSession: (session: CourseSessionToBook) => Promise<void>;
}

export const EventCalendarDayPeriod = ({
  dayPeriod,
  sessions,
  topic,
  instructorId,
  handleBookCourseSession,
}: IEventCalendarDayPeriodProps) => {
  const { t } = useTranslation();
  const { lg } = useResponsive();

  if (sessions.length === 0) return null;

  const iconClassName = 'w-20px h-20px text-gray-500 mt-1 lg:mt-0';

  const timeLabel = (
    <span className="text-caption font-semibold text-gray-500">
      {dayPeriod === 'morning' && '00:01 - 12:00'}
      {dayPeriod === 'afternoon' && '12:01 - 18:00'}
      {dayPeriod === 'evening' && '18:01 - 00:00'}
    </span>
  );

  return (
    <div className="space-y-6 border border-gray-200 bg-gray-100 p-6 lg:rounded-3xl">
      <div className="flex items-start justify-between lg:items-center">
        <div className="flex items-start space-x-4 lg:items-center">
          {dayPeriod === 'morning' && <Morning className={iconClassName} />}
          {dayPeriod === 'afternoon' && <Afternoon className={iconClassName} />}
          {dayPeriod === 'evening' && <Evening className={iconClassName} />}
          <div>
            <h3 className="text-subheading font-bold text-gray-650">
              {t(`eventCalendarPage.${dayPeriod}Session`)}
            </h3>
            {!lg && timeLabel}
          </div>
          {lg && timeLabel}
        </div>

        <div className="text-caption font-semibold text-gray-500">
          {sessions.length} session{sessions.length === 1 ? '' : 's'}
        </div>
      </div>

      {sessions.map((session) => (
        <EventCalendarSession
          key={session.id}
          session={session}
          topic={topic}
          instructorId={instructorId}
          handleBookCourseSession={handleBookCourseSession}
        />
      ))}
    </div>
  );
};
