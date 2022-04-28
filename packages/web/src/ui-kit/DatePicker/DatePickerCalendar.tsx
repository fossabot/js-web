import { Placement } from '@popperjs/core';
import { addMonths, isEqual, startOfMonth } from 'date-fns';
import { CSSProperties, forwardRef, useState } from 'react';
import { TiWarning } from 'react-icons/ti';
import { IDatePickerProps } from './DatePicker';
import {
  DatePickerCalendarDates,
  IDatePickerCalendarDatesProps,
} from './DatePickerCalendarDates';
import { DatePickerCalendarMonths } from './DatePickerCalendarMonths';
import { DatePickerCalendarYears } from './DatePickerCalendarYears';

export interface IDatePickerCalendarProps {
  startDate: Date | null;
  endDate?: Date | null;
  placement: Placement;
  style: CSSProperties;
  disabledDates?: IDatePickerProps['disabledDates'];
  allowedDates?: IDatePickerProps['allowedDates'];
  onChangeStartDate: (date: Date) => void;
  onChangeEndDate?: (date: Date) => void;
  minDate?: IDatePickerProps['minDate'];
  maxDate?: IDatePickerProps['maxDate'];
  error?: IDatePickerProps['error'];
  changeCalendarBy: IDatePickerProps['changeCalendarBy'];
  size?: IDatePickerProps['size'];
  classNames?: IDatePickerCalendarDatesProps['classNames'];
  cellSize?: IDatePickerCalendarDatesProps['cellSize'];
  withTime?: boolean;
  overrideShowDateRange?: boolean;
}

export type CalendarView = 'dates' | 'months' | 'years';

export const DatePickerCalendar = forwardRef<
  HTMLDivElement,
  IDatePickerCalendarProps
>(
  (
    {
      startDate,
      endDate,
      placement,
      style,
      disabledDates,
      allowedDates,
      onChangeStartDate,
      onChangeEndDate,
      minDate,
      maxDate,
      error,
      changeCalendarBy,
      size,
      classNames,
      cellSize,
      withTime = false,
      overrideShowDateRange = false,
    },
    ref,
  ) => {
    const [startCalendarView, setStartCalendarView] =
      useState<CalendarView>('dates');
    const [endCalendarView, setEndCalendarView] =
      useState<CalendarView>('dates');

    const [startCalendarDate, setStartCalendarDate] = useState(
      startOfMonth(startDate || new Date()),
    );
    const [endCalendarDate, setEndCalendarDate] = useState(() => {
      if (endDate || overrideShowDateRange) {
        const endMonth = startOfMonth(endDate || new Date());
        // if same day, set calendar date to next month
        if (isEqual(endMonth, startCalendarDate)) {
          return addMonths(endMonth, 1);
        }
        return endMonth;
      }
      return undefined;
    });

    const renderError = () => {
      const errorElement = error?.(startCalendarDate) || null;

      if (errorElement) {
        return (
          <div className="mb-3 flex w-full items-center justify-center space-x-2 rounded-lg bg-red-200 py-3 px-4 text-caption font-semibold text-white">
            <TiWarning className="text-body"></TiWarning>

            <span>{errorElement}</span>
          </div>
        );
      }

      return null;
    };

    return (
      <div
        ref={ref}
        style={style}
        data-placement={placement}
        className="z-60 w-full lg:w-auto"
        tabIndex={-1}
      >
        <div className="rounded-lg border border-gray-300 bg-gray-100 p-6 shadow">
          {renderError()}
          <div className="flex space-x-8">
            {startCalendarView === 'dates' && (
              <DatePickerCalendarDates
                {...{
                  onChange: onChangeStartDate,
                  date: startDate,
                  dateRange: endDate,
                  maxDate,
                  minDate,
                  disabledDates,
                  allowedDates,
                  calendarDate: startCalendarDate,
                  setCalendarDate: setStartCalendarDate,
                  changeCalendarBy,
                  setCalendarView: setStartCalendarView,
                  size,
                  classNames,
                  cellSize,
                  withTime,
                }}
              />
            )}
            {startCalendarView === 'months' && (
              <DatePickerCalendarMonths
                {...{
                  calendarDate: startCalendarDate,
                  setCalendarDate: setStartCalendarDate,
                  setCalendarView: setStartCalendarView,
                }}
              />
            )}
            {startCalendarView === 'years' && (
              <DatePickerCalendarYears
                {...{
                  calendarDate: startCalendarDate,
                  setCalendarDate: setStartCalendarDate,
                  setCalendarView: setStartCalendarView,
                }}
              />
            )}
            {(overrideShowDateRange || (endDate && onChangeEndDate)) && (
              <>
                {endCalendarView === 'dates' && (
                  <DatePickerCalendarDates
                    {...{
                      onChange: onChangeEndDate,
                      date: endDate,
                      dateRange: startDate,
                      maxDate,
                      minDate,
                      disabledDates,
                      allowedDates,
                      calendarDate: endCalendarDate,
                      setCalendarDate: setEndCalendarDate,
                      changeCalendarBy,
                      setCalendarView: setEndCalendarView,
                      size,
                      classNames,
                      cellSize,
                      withTime,
                    }}
                  />
                )}
                {endCalendarView === 'months' && (
                  <DatePickerCalendarMonths
                    {...{
                      calendarDate: endCalendarDate,
                      setCalendarDate: setEndCalendarDate,
                      setCalendarView: setEndCalendarView,
                    }}
                  />
                )}
                {endCalendarView === 'years' && (
                  <DatePickerCalendarYears
                    {...{
                      calendarDate: endCalendarDate,
                      setCalendarDate: setEndCalendarDate,
                      setCalendarView: setEndCalendarView,
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
);

DatePickerCalendar.displayName = 'DatePickerCalendar';
