import cx from 'classnames';
import {
  addDays,
  addMonths,
  format,
  getDaysInMonth,
  isAfter,
  isBefore,
  isEqual,
  isToday,
  startOfDay,
} from 'date-fns';
import { Dispatch, ReactNode, useMemo } from 'react';
import { dayNames } from '../../constants/datetime';
import { ChevronRight } from '../icons';
import { IDatePickerProps } from './DatePicker';
import { CalendarView } from './DatePickerCalendar';
import { DatePickerSelect } from './DatePickerSelect';

export type IDatePickerCalendarDatesProps = {
  date: Date;
  dateRange?: Date;
  calendarDate: Date;
  setCalendarDate: (date: Date) => void;
  disabledDates?: IDatePickerProps['disabledDates'];
  allowedDates?: IDatePickerProps['allowedDates'];
  minDate?: IDatePickerProps['minDate'];
  maxDate?: IDatePickerProps['maxDate'];
  onChange: Dispatch<Date | null>;
  changeCalendarBy: IDatePickerProps['changeCalendarBy'];
  setCalendarView: (view: CalendarView) => void;
  size?: IDatePickerProps['size'];
  classNames?: {
    calendarDate?: string;
    grid?: string;
  };
  cellSize?: number;
  withTime?: boolean;
};

export const DatePickerCalendarDates = ({
  date,
  dateRange,
  onChange,
  calendarDate,
  disabledDates,
  allowedDates,
  minDate,
  maxDate,
  setCalendarDate,
  changeCalendarBy,
  setCalendarView,
  size,
  classNames,
  cellSize = 2.75,
  withTime = false,
}: IDatePickerCalendarDatesProps) => {
  const calendarDates = useMemo(() => {
    const dayStart = calendarDate.getDay();

    const calendarDates: ReactNode[] = [];

    // fill in previous month
    for (let day = 0; day < dayStart; day++) {
      calendarDates.push(<div className="h-full w-full"></div>);
    }

    // insert current month dates
    for (let day = 0; day < getDaysInMonth(calendarDate); day++) {
      const currDate = addDays(calendarDate, day);
      const dateNumber = currDate.getDate();
      const allowed = allowedDates
        ? typeof allowedDates === 'function'
          ? allowedDates(currDate)
          : allowedDates[dateNumber]
        : null;
      let disabled =
        disabledDates === 'all' ||
        disabledDates?.[dateNumber] ||
        (typeof disabledDates === 'function' && disabledDates(currDate)) ||
        (minDate && isBefore(currDate, minDate)) ||
        (maxDate && isAfter(currDate, maxDate));

      if (allowed !== null && !disabled) {
        disabled = !allowed;
      }

      const isCurrDate =
        isEqual(currDate, startOfDay(date)) ||
        (dateRange && isEqual(currDate, dateRange));

      let isStartOfRange = false;
      let isEndOfRange = false;
      let isWithinRange = false;
      if (dateRange) {
        const [startRange, endRange] = isBefore(date, dateRange)
          ? [date, dateRange]
          : [dateRange, date];

        if (isEqual(startRange, currDate)) isStartOfRange = true;
        if (isEqual(endRange, currDate)) {
          isEndOfRange = true;
        }

        if (isBefore(startRange, currDate) && isBefore(currDate, endRange))
          isWithinRange = true;
      }

      calendarDates.push(
        <>
          <button
            type="button"
            disabled={disabled}
            className={cx('relative h-full w-full font-semibold', {
              'rounded-full': !dateRange,
              'pointer-events-none text-gray-400': disabled,
              'bg-maroon-400 text-white': isCurrDate,
              'hover:bg-gray-200': !isCurrDate && !disabled,
              'bg-gray-200': isWithinRange,
              'rounded-tl-full rounded-bl-full': isStartOfRange,
              'rounded-tr-full rounded-br-full': isEndOfRange,
            })}
            style={{ maxWidth: `${cellSize}rem` }}
            onClick={() => {
              onChange(currDate);
            }}
          >
            {dateNumber}
            {isToday(currDate) && (
              <div className="absolute top-0 right-0 h-1 w-1 rounded-full bg-brand-primary" />
            )}
          </button>
        </>,
      );
    }

    // fill in next month dates
    if (calendarDates.length < 35) {
      const daysToFillIn = 35 - calendarDates.length;

      for (let i = 0; i < daysToFillIn; i++) {
        calendarDates.push(<div className="h-full w-full"></div>);
      }
    }

    if (calendarDates.length > 35) {
      const daysToFillIn = 42 - calendarDates.length;
      for (let i = 0; i < daysToFillIn; i++) {
        calendarDates.push(<div></div>);
      }
    }

    return calendarDates;
  }, [calendarDate, date, disabledDates, allowedDates, dateRange]);

  return (
    <div className="w-full">
      <div className="flex overflow-hidden rounded-lg border border-gray-300">
        <button
          type="button"
          className="outline-none focus:outline-none border-r border-gray-200 bg-gray-100 py-3 px-2 active:bg-gray-200"
          onClick={() => setCalendarDate(addMonths(calendarDate, -1))}
        >
          <ChevronRight
            className="text-gray-400"
            style={{ transform: 'rotateZ(180deg)' }}
          />
        </button>
        {changeCalendarBy === 'month' && (
          <div className="flex flex-1 items-center justify-center bg-white">
            <span className="font-semibold text-gray-650">
              {format(calendarDate, 'MMMM yyyy')}
            </span>
          </div>
        )}
        {changeCalendarBy === 'month-and-year' && (
          <div className="flex flex-1 items-center justify-center space-x-1 bg-white">
            <button
              type="button"
              className="rounded py-1 px-2 hover:bg-gray-200"
              onClick={() => setCalendarView('months')}
            >
              {format(calendarDate, 'MMMM')}
            </button>
            <button
              type="button"
              className="rounded py-1 px-2 hover:bg-gray-200"
              onClick={() => setCalendarView('years')}
            >
              {format(calendarDate, 'yyyy')}
            </button>
          </div>
        )}
        <button
          type="button"
          className="outline-none focus:outline-none border-l border-gray-200 bg-gray-100 py-3 px-2 active:bg-gray-200"
          onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
        >
          <ChevronRight className="text-gray-400" />
        </button>
      </div>
      <div
        className={cx(
          'mt-6 grid auto-rows-11 grid-cols-7-auto gap-0',
          classNames?.grid ? classNames.grid : 'lg:gap-4',
          size === 'small'
            ? 'lg:auto-rows-7 lg:grid-cols-7-7'
            : 'lg:auto-rows-11 lg:grid-cols-7-11',
        )}
      >
        {dayNames.map((name) => (
          <div key={name} className="flex items-center justify-center">
            <span className="text-footnote font-bold text-gray-650">
              {name.toUpperCase().slice(0, 3)}
            </span>
          </div>
        ))}
        {calendarDates.map((date, i) => (
          <div
            className={cx(
              'relative flex items-center justify-center',
              classNames?.calendarDate,
            )}
            key={`${calendarDate.getFullYear()}-${calendarDate.getMonth()}-${i}`}
          >
            {date}
          </div>
        ))}
      </div>
      {withTime && (
        <div className="mt-4 flex items-center border-t border-gray-300 pt-4">
          <span className="flex-1 font-semibold">Time</span>
          <DatePickerSelect date={date} onChange={onChange} type="hour" />
          <span className="mx-2 font-semibold">:</span>
          <DatePickerSelect date={date} onChange={onChange} type="minute" />
        </div>
      )}
    </div>
  );
};
