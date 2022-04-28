import cx, { Argument } from 'classnames';
import { format } from 'date-fns';
import { Dispatch, useEffect, useState } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import useTranslation from '../i18n/useTranslation';
import { Calendar, ChevronDown, Close, Filter } from '../ui-kit/icons';
import { EventCalendarView } from '../hooks/useSessionCalendar';

interface IEventCalendarMobileFiltersProps {
  view: EventCalendarView;
  setView: Dispatch<EventCalendarView>;
  date: Date | null;
  isFixedMobile?: boolean;
  className?: Argument | Argument[];
  isLoading?: boolean;
}

export const EventCalendarMobileFilters = ({
  view,
  setView,
  date,
  isFixedMobile = true,
  className,
  isLoading = false,
}: IEventCalendarMobileFiltersProps) => {
  const { t } = useTranslation();
  const { lg } = useResponsive();

  const [stickyTop, setStickyTop] = useState('65px');
  useEffect(() => {
    setTimeout(() => {
      const header = document.querySelector(`[data-id="main-navbar"]`);

      if (header) {
        // + 1 for header border
        setStickyTop(`${header.clientHeight + 1}px`);
      }
    }, 1000);
    // make sure recalculate top value when layout changes
  }, [lg]);

  if (isLoading)
    return (
      <div className="flex h-14 w-full animate-pulse bg-gray-200 lg:hidden" />
    );

  if (!isLoading)
    return (
      <div
        className={cx(
          'z-40 h-14 w-full lg:sticky',
          {
            sticky: !isFixedMobile,
            fixed: isFixedMobile,
          },
          className,
        )}
        style={{ top: stickyTop }}
      >
        <div className="flex h-full border-b border-gray-200 bg-white">
          <a
            role="button"
            className={cx(
              'flex h-full flex-1 items-center justify-between space-x-2 border-r border-gray-200 p-4',
              { 'bg-gray-100': view === 'side-filters' },
            )}
            onClick={() =>
              setView(view === 'side-filters' ? 'sessions' : 'side-filters')
            }
          >
            <div className="flex space-x-2">
              <Calendar />

              {date && (
                <div className="font-semibold">
                  {format(date, 'EEE - dd MMM yy').toUpperCase()}
                </div>
              )}
            </div>
            {view === 'side-filters' ? <Close /> : <ChevronDown />}
          </a>
          <a
            role="button"
            className={cx('flex h-full items-center space-x-2 p-4', {
              'bg-gray-100': view === 'top-filters',
            })}
            onClick={() =>
              setView(view === 'top-filters' ? 'sessions' : 'top-filters')
            }
          >
            <Filter />
            <span className="font-semibold">
              {t('eventCalendarPage.filters')}
            </span>
            <div className="w-4">
              {view === 'top-filters' ? <Close /> : <ChevronDown />}
            </div>
          </a>
        </div>
      </div>
    );
};
