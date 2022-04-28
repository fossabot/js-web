import { ReactNode } from 'react';
import { CourseSessionToBook } from '../hooks/useBookSession';
import { ICourseSession } from '../models/course';
import { UpcomingSessionCard } from './UpcomingSessionCard';

interface IEventCalendarDayPeriodProps {
  sessions: ICourseSession[];
  handleBookCourseSession: (session: CourseSessionToBook) => Promise<void>;
  headingContent: ReactNode;
}

export const UpcomingSessionDatePeriod = ({
  sessions,
  handleBookCourseSession,
  headingContent,
}: IEventCalendarDayPeriodProps) => {
  if (sessions.length === 0) return null;

  return (
    <div className="space-y-6 border-gray-200 bg-gray-100 p-6 lg:rounded-3xl lg:border">
      <div className="flex items-start justify-between lg:items-center">
        <div className="flex items-start space-x-4 lg:items-center">
          {headingContent}
        </div>

        <div className="text-caption font-semibold text-gray-500">
          {sessions.length} session{sessions.length === 1 ? '' : 's'}
        </div>
      </div>

      {sessions.map((session) => (
        <UpcomingSessionCard
          key={session.id}
          session={session}
          handleBookCourseSession={handleBookCourseSession}
        />
      ))}
    </div>
  );
};
