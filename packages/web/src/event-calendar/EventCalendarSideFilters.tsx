import cx, { Argument } from 'classnames';
import { Dispatch } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import SessionCalendarSkeleton from '../shared/skeletons/SessionCalendarSkeleton';
import useTranslation from '../i18n/useTranslation';
import { CourseSubCategoryKey } from '../models/course';
import Button from '../ui-kit/Button';
import {
  DatePickerCalendar,
  IDatePickerCalendarProps,
} from '../ui-kit/DatePicker/DatePickerCalendar';
import {
  Afternoon,
  Evening,
  FaceToFace,
  FaceToFaceGray,
  Morning,
  Virtual,
  VirtualGray,
} from '../ui-kit/icons';
import {
  DayPeriod,
  EventCalendarView,
  LearningStyle,
} from '../hooks/useSessionCalendar';
import { FilterButton } from './FilterButton';
import SessionSideFilterSkeleton from '../shared/skeletons/SessionSideFilterSkeleton';

interface IEventCalendarSideFiltersProps {
  date: Date;
  setDate: Dispatch<Date>;
  learningStyle?: LearningStyle;
  setLearningStyle?: Dispatch<LearningStyle>;
  dayPeriod?: DayPeriod;
  setDayPeriod?: Dispatch<DayPeriod>;
  allowedDates: IDatePickerCalendarProps['allowedDates'];
  setView: Dispatch<EventCalendarView>;
  className?: Argument | Argument[];
  hideButtons?: boolean;
  isLoading?: boolean;
}

export const EventCalendarSideFilters = ({
  date,
  setDate,
  learningStyle,
  setLearningStyle,
  dayPeriod,
  setDayPeriod,
  allowedDates,
  setView,
  className,
  hideButtons = false,
  isLoading = false,
}: IEventCalendarSideFiltersProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div
        className={cx(
          'bottom-6 w-full space-y-4 px-7 lg:top-36 lg:w-auto lg:px-0',
          className,
        )}
      >
        {isLoading ? (
          <SessionCalendarSkeleton />
        ) : (
          <DatePickerCalendar
            startDate={date}
            placement="auto"
            style={{}}
            onChangeStartDate={setDate}
            changeCalendarBy={'month'}
            classNames={{ calendarDate: 'text-caption', grid: 'gap-2' }}
            cellSize={2}
            allowedDates={allowedDates}
            size="small"
          />
        )}
        {(learningStyle || setLearningStyle) && isLoading && (
          <SessionSideFilterSkeleton size="learningStyle" />
        )}
        {(learningStyle || setLearningStyle) && !isLoading && (
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
              onClick={() =>
                setLearningStyle(CourseSubCategoryKey.FACE_TO_FACE)
              }
              isActive={learningStyle === CourseSubCategoryKey.FACE_TO_FACE}
              icon={
                learningStyle === CourseSubCategoryKey.FACE_TO_FACE
                  ? FaceToFace
                  : FaceToFaceGray
              }
            />
          </div>
        )}
        {(dayPeriod || setDayPeriod) && isLoading && (
          <SessionSideFilterSkeleton size="dayPeriod" />
        )}
        {(dayPeriod || setDayPeriod) && !isLoading && (
          <div className="w-full rounded-lg border border-gray-300">
            <FilterButton
              text={t('eventCalendarPage.allDay')}
              onClick={() => setDayPeriod(null)}
              isActive={dayPeriod === null}
            />
            <FilterButton
              text={
                <>
                  <span>{t('eventCalendarPage.morning')}</span>
                  <span className="ml-4 text-footnote font-regular">
                    00:01 - 12:00
                  </span>
                </>
              }
              onClick={() => setDayPeriod('morning')}
              isActive={dayPeriod === 'morning'}
              icon={Morning}
            />
            <FilterButton
              text={
                <>
                  <span>{t('eventCalendarPage.afternoon')}</span>
                  <span className="ml-4 text-footnote font-regular">
                    12:01 - 18:00
                  </span>
                </>
              }
              onClick={() => setDayPeriod('afternoon')}
              isActive={dayPeriod === 'afternoon'}
              icon={Afternoon}
            />
            <FilterButton
              text={
                <>
                  <span>{t('eventCalendarPage.evening')}</span>
                  <span className="ml-4 text-footnote font-regular">
                    18:01 - 00:00
                  </span>
                </>
              }
              onClick={() => setDayPeriod('evening')}
              isActive={dayPeriod === 'evening'}
              icon={Evening}
            />
          </div>
        )}
      </div>
      {!hideButtons && (
        <div className="fixed bottom-0 flex w-full space-x-4 border-t border-gray-200 bg-white p-6 lg:hidden">
          <Button
            variant="secondary"
            size="medium"
            onClick={() => {
              unstable_batchedUpdates(() => {
                if (learningStyle) setLearningStyle(null);
                if (setDayPeriod) setDayPeriod(null);
              });
            }}
          >
            {t('eventCalendarPage.clear')}
          </Button>
          <Button
            variant="primary"
            size="medium"
            onClick={() => setView('sessions')}
          >
            {t('eventCalendarPage.apply')}
          </Button>
        </div>
      )}
    </>
  );
};
