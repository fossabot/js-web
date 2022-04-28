import { addMonths, format, isBefore, startOfDay } from 'date-fns';
import { FC, MutableRefObject } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import useTranslation from '../i18n/useTranslation';
import { DatePicker } from '../ui-kit/DatePicker/DatePicker';
import { Afternoon, Calendar, Close, Evening, Morning } from '../ui-kit/icons';

type ICourseSessionCalendarProps = {
  currDate: Date;
  setCurrDate: (date: Date) => void;
  showCalendarButtonRef: MutableRefObject<HTMLButtonElement>;
  allowedDates: (date: Date) => boolean;
};

export const CourseSessionCalendar = ({
  currDate,
  setCurrDate,
  showCalendarButtonRef,
  allowedDates,
}: ICourseSessionCalendarProps) => {
  const { t } = useTranslation();
  const { lg } = useResponsive();
  const threeMonthsFromNow = addMonths(new Date(), 3);

  const calendarTimeLinks: {
    Icon: FC<{ className: string }>;
    label: string;
    time: string;
  }[] = [
    {
      Icon: Morning,
      label: t('courseSessionsPage.morning'),
      time: '00:00',
    },
    {
      Icon: Afternoon,
      label: t('courseSessionsPage.afternoon'),
      time: '12:00',
    },
    {
      Icon: Evening,
      label: t('courseSessionsPage.evening'),
      time: '18:00',
    },
  ];

  return (
    <div className="sticky bottom-6 z-2 w-full px-7 lg:top-36 lg:w-55 lg:px-0">
      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow lg:shadow-none">
        <DatePicker
          startDate={currDate}
          allowedDates={allowedDates}
          placement={lg ? 'right-start' : 'top'}
          onChange={([date]) => setCurrDate(date)}
          error={(calendarDate) => {
            if (isBefore(threeMonthsFromNow, calendarDate))
              return t('courseSessionsPage.timetableNotAvailable');
            return null;
          }}
          maxDate={threeMonthsFromNow}
          minDate={startOfDay(new Date())}
          changeCalendarBy="month"
        >
          {({ ref, showCalendar, isShowingCalendar }) => (
            <div
              ref={ref}
              className="flex items-center bg-gray-100 p-4 lg:block lg:space-x-0 lg:space-y-2"
            >
              <div className="flex items-center space-x-3">
                <Calendar />
                <span className="hidden text-caption font-semibold text-gray-500 lg:inline">
                  {t('courseSessionsPage.date')}
                </span>
              </div>
              <h6 className="ml-2 text-base font-bold text-black lg:ml-0 lg:text-heading">
                {currDate && format(currDate, 'iii')} -{' '}
                {currDate && format(currDate, 'dd MMM yy').toUpperCase()}
              </h6>
              {isShowingCalendar ? (
                <button className="ml-auto flex items-center space-x-2 text-caption font-semibold text-gray-650">
                  <Close />
                  <span>{t('courseSessionsPage.close')}</span>
                </button>
              ) : (
                <button
                  ref={showCalendarButtonRef}
                  className="ml-auto text-caption font-semibold text-brand-primary"
                  onClick={showCalendar}
                >
                  {t('courseSessionsPage.change')}
                </button>
              )}
            </div>
          )}
        </DatePicker>
        <div className="hidden border-t border-gray-200 lg:block">
          {calendarTimeLinks.map(({ Icon, label, time }) => (
            <a
              role="button"
              onClick={() => {
                const header = document.getElementById(label.toLowerCase());
                header?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              key={label}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center space-x-3">
                <Icon className="text-gray-500" />
                <span className="text-caption font-medium text-gray-650">
                  {label}
                </span>
              </div>
              <span className="text-footnote font-medium text-gray-500">
                {time}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
