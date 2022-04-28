import { format } from 'date-fns';
import { Dispatch, ReactNode } from 'react';
import { CourseSubCategoryKey, ICourseSessionCalendar } from '../models/course';
import {
  FaceToFace,
  FaceToFaceGray,
  Virtual,
  VirtualGray,
} from '../ui-kit/icons';
import cx from 'classnames';

interface ICourseSessionGroupProps {
  courseTitle: ReactNode;
  outlines: {
    id: string;
    title: ReactNode;
    category: ReactNode;
    sessions: ICourseSessionCalendar[];
  }[];
  onSelectSession: Dispatch<ICourseSessionCalendar>;
  selectedSession: ICourseSessionCalendar | null;
}

export const CourseSessionGroup = ({
  courseTitle,
  outlines,
  onSelectSession,
  selectedSession,
}: ICourseSessionGroupProps) => {
  return (
    <div className="space-y-2">
      <span className="text-lg font-bold">{courseTitle}</span>
      <div className="space-y-2 pl-4">
        {outlines.map((outline) => (
          <div className="space-y-2" key={outline.id}>
            <span className="text-lg font-semibold">{outline.title}</span>
            <div className="flex flex-col items-start space-y-2 pl-4">
              {outline.sessions.map((session) => {
                const isSelected = selectedSession?.id === session.id;
                return (
                  <a
                    role="button"
                    key={session.id}
                    className={cx(
                      'rounded border py-2 px-4 hover:bg-gray-200',
                      {
                        'border-brand-primary text-brand-primary': isSelected,
                      },
                    )}
                    onClick={() => onSelectSession(session)}
                  >
                    <div className="flex items-center space-x-1">
                      {outline.category === CourseSubCategoryKey.VIRTUAL &&
                        (isSelected ? <Virtual /> : <VirtualGray />)}
                      {outline.category === CourseSubCategoryKey.FACE_TO_FACE &&
                        (isSelected ? <FaceToFace /> : <FaceToFaceGray />)}
                      <span>
                        {format(new Date(session.startDateTime), 'HH:mm')}-
                        {format(new Date(session.endDateTime), 'HH:mm')}
                      </span>
                    </div>
                    <div>
                      {session.instructors[0]?.firstName}{' '}
                      {session.instructors[0]?.lastName}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
