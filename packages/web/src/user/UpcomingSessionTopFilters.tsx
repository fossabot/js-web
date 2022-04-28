import { Dispatch } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { FilterButton } from '../event-calendar/FilterButton';
import useTranslation from '../i18n/useTranslation';
import { CourseSubCategoryKey } from '../models/course';
import Button from '../ui-kit/Button';
import { EventCalendarView, LearningStyle } from '../hooks/useSessionCalendar';
import {
  FaceToFace,
  FaceToFaceGray,
  Virtual,
  VirtualGray,
} from '../ui-kit/icons';

export interface IUpcomingSessionTopFilter {
  setView: Dispatch<EventCalendarView>;
  learningStyle?: LearningStyle;
  setLearningStyle?: Dispatch<LearningStyle>;
}

export const UpcomingSessionTopFilter = ({
  learningStyle,
  setLearningStyle,
  setView,
}: IUpcomingSessionTopFilter) => {
  const { t } = useTranslation();

  return (
    <div className="fixed h-full w-full bg-gray-100">
      <div className="flex w-full bg-white py-4 px-6">
        <div className="w-full rounded-lg border border-gray-300">
          <FilterButton
            text={t('eventCalendarPage.allLearningStyles')}
            onClick={() => setLearningStyle(null)}
            isActive={learningStyle === null}
          />
          <FilterButton
            text={t('eventCalendarPage.virtual')}
            onClick={() => setLearningStyle(CourseSubCategoryKey.VIRTUAL)}
            isActive={learningStyle === CourseSubCategoryKey.VIRTUAL}
            icon={
              learningStyle === CourseSubCategoryKey.VIRTUAL
                ? Virtual
                : VirtualGray
            }
          />
          <FilterButton
            text={t('eventCalendarPage.faceToFace')}
            onClick={() => setLearningStyle(CourseSubCategoryKey.FACE_TO_FACE)}
            isActive={learningStyle === CourseSubCategoryKey.FACE_TO_FACE}
            icon={
              learningStyle === CourseSubCategoryKey.FACE_TO_FACE
                ? FaceToFace
                : FaceToFaceGray
            }
          />
        </div>
      </div>
      <div className="fixed bottom-0 flex w-full space-x-4 border-t border-b border-gray-200 bg-white p-6">
        <Button
          variant="secondary"
          size="medium"
          onClick={() => {
            unstable_batchedUpdates(() => {
              setLearningStyle(null);
            });
          }}
        >
          {t('eventCalendarPage.clear')}
        </Button>
        <Button
          variant="primary"
          size="medium"
          onClick={() => {
            setView('sessions');
          }}
        >
          {t('eventCalendarPage.apply')}
        </Button>
      </div>
    </div>
  );
};
