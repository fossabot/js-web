// modified from https://github.com/fareez-ahamed/react-datepicker/blob/master/src/Datepicker.tsx

import React, { useRef, useContext } from 'react';
import { FaRegCalendar } from 'react-icons/fa';
import CloseIcon from '../../ui-kit/icons/Close';
import {
  FiCalendar as CalendarIcon,
  FiChevronLeft as ChevronLeft,
  FiChevronRight as ChevronRight,
} from 'react-icons/fi';
import { Manager, Reference, Popper } from 'react-popper';
import { DatepickerCtx, useDatepickerCtx } from './DatepickerContext';
import { format } from 'date-fns';
import cx from 'classnames';
import InputSection, { IInputSection } from '../InputSection';

const daysOfWeekNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const inputStyle = {
  paddingTop: '0.375rem',
  paddingBottom: '0.375rem',
};

interface DatePickerProps {
  date: Date;
  onChange: (date: Date) => void;
  className?: string;
  clearable?: boolean;
  inputSectionProps?: Partial<IInputSection>;
}

export const DatePicker: React.FC<DatePickerProps> = (props) => (
  <RawDatePicker
    date={props.date}
    onChange={props.onChange}
    className={props.className}
    clearable={props.clearable}
    inputSectionProps={props.inputSectionProps}
  ></RawDatePicker>
);

export const RawDatePicker: React.FC<{
  date: Date;
  onChange: (date: Date) => void;
  clearable: boolean;
  className?: string;
  inputSectionProps?: Partial<IInputSection>;
}> = ({ date, onChange, className, clearable, inputSectionProps }) => {
  const popupNode = useRef<HTMLElement>();
  const ctxValue = useDatepickerCtx(date, onChange, popupNode);
  const ClearIcon = (
    <CloseIcon
      className="block cursor-pointer"
      onClick={() => onChange(null)}
    />
  );

  return (
    <DatepickerCtx.Provider value={ctxValue}>
      <Manager>
        <Reference>
          {({ ref }) => (
            <div className="flex" ref={ref}>
              <InputSection
                name=""
                type="text"
                placeholder="DD / MM / YYYY"
                onFocus={(e) => ctxValue.showCalendar()}
                value={formattedDate(date)}
                iconRight={clearable && date ? ClearIcon : <FaRegCalendar />}
                readOnly
                {...inputSectionProps}
              />
            </div>
          )}
        </Reference>
        <Popper
          placement="bottom-start"
          innerRef={(node) => (popupNode.current = node)}
        >
          {({ ref, style, placement, arrowProps }) =>
            ctxValue.isVisible ? (
              <Calendar
                placement={placement}
                style={style}
                ref={ref as React.Ref<HTMLDivElement>}
                className={className}
              />
            ) : null
          }
        </Popper>
      </Manager>
    </DatepickerCtx.Provider>
  );
};

interface CalendarProps {
  style: React.CSSProperties;
  placement: string;
  ref: React.Ref<HTMLDivElement>;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = React.forwardRef<
  HTMLDivElement,
  CalendarProps
>((props, ref) => {
  const { view } = useContext(DatepickerCtx);

  let selectionComponent = null;
  switch (view) {
    case 'date':
      selectionComponent = <DateSelection />;
      break;
    case 'month':
      selectionComponent = <MonthSelection />;
      break;
    case 'year':
      selectionComponent = <YearSelection />;
      break;
  }

  return (
    <div
      className={cx(
        'relative w-64 max-w-xs rounded-lg bg-white p-2 shadow-lg',
        props.className,
      )}
      ref={ref}
      data-placement={props.placement}
      style={props.style}
    >
      {selectionComponent}
    </div>
  );
});

/**
 * Date Selection Component
 * @param props
 */
const DateSelection: React.FC<{}> = (props) => {
  const {
    nextMonth,
    prevMonth,
    viewMonths,
    viewYears,
    selectDate,
    visible: { month, year },
    isSelectedDate,
  } = useContext(DatepickerCtx);

  const dates = [];

  for (let i = 0; i < beginningDayOfWeek(month, year); i++) {
    dates.push(<div key={`emptybefore${i}`}></div>);
  }

  for (let i = 1; i <= daysInMonth(month, year); i++) {
    dates.push(
      <button
        type="button"
        key={`day${i}`}
        className={`rounded p-1 text-sm hover:bg-gray-200 ${
          isSelectedDate(i) ? 'bg-gray-300 font-semibold' : ''
        }`}
        onClick={() => selectDate(i)}
        style={{ textAlign: 'center' }}
      >
        {i}
      </button>,
    );
  }

  return (
    <div
      className="text-gray-800"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr',
        gridTemplateRows: '2rem auto',
        alignItems: 'stretch',
      }}
    >
      <button
        type="button"
        className={buttonClassName}
        onClick={(e) => prevMonth()}
      >
        <ChevronLeft size={20} className="stroke-current" />
      </button>

      <button
        type="button"
        className={`${buttonClassName} font-semibold`}
        style={{ gridColumn: '2/5' }}
        onClick={(e) => viewMonths()}
      >
        {monthNames[month]}
      </button>

      <button
        type="button"
        className={`${buttonClassName} font-semibold`}
        style={{ gridColumn: '5/7' }}
        onClick={(e) => viewYears()}
      >
        {year}
      </button>

      <button
        type="button"
        className={buttonClassName}
        onClick={(e) => nextMonth()}
      >
        <ChevronRight size={20} className="stroke-current" />
      </button>

      {daysOfWeekNames.map((day) => (
        <div
          key={(200 + day).toString()}
          className="p-1 text-sm font-semibold"
          style={{ textAlign: 'center' }}
        >
          {day[0]}
        </div>
      ))}

      {dates}
    </div>
  );
};

/**
 * Month Selection Component
 * @param props
 */
const MonthSelection: React.FC<{}> = (props) => {
  const { viewYears, selectMonth, nextYear, prevYear, visible } =
    useContext(DatepickerCtx);

  return (
    <div
      className="h-48"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gridTemplateRows: '2rem auto',
        alignItems: 'stretch',
      }}
    >
      <div className="flex" style={{ gridColumn: '1/5' }}>
        <CalButton chevron="left" onClick={(e) => prevYear()} />
        <CalButton className="flex-grow" onClick={(e) => viewYears()}>
          {visible.year}
        </CalButton>
        <CalButton chevron="right" onClick={(e) => nextYear()} />
      </div>

      {monthNames.map((month, index) => (
        <CalButton onClick={(e) => selectMonth(index)}>
          {month.substring(0, 3)}
        </CalButton>
      ))}
    </div>
  );
};

/**
 * Year Selection Component
 * @param props
 */
const YearSelection: React.FC<{}> = (props) => {
  const {
    selectYear,
    prevDecade,
    nextDecade,
    visible: { year },
  } = useContext(DatepickerCtx);

  let years = [];
  let [minYear, maxYear] = [year - 6, year + 6];

  for (let i = minYear; i < maxYear; i++) {
    years.push(<CalButton onClick={(e) => selectYear(i)}>{i}</CalButton>);
  }

  return (
    <div
      className="h-48"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gridTemplateRows: '2rem auto',
        alignItems: 'stretch',
      }}
    >
      <div className="flex" style={{ gridColumn: '1/5' }}>
        <CalButton chevron="left" onClick={(e) => prevDecade()} />
        <CalButton className="flex-grow">
          {`${minYear} - ${maxYear - 1}`}
        </CalButton>
        <CalButton chevron="right" onClick={(e) => nextDecade()} />
      </div>

      {years}
    </div>
  );
};

const buttonClassName =
  'hover:bg-gray-200 rounded p-1 text-sm flex align-center justify-center focus:outline-none';

const CalButton: React.FC<{
  chevron?: 'right' | 'left';
  className?: string;
  style?: React.StyleHTMLAttributes<HTMLButtonElement>;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}> = (props) => {
  let children = null;

  if (props.chevron && props.chevron === 'left')
    children = <ChevronLeft size={20} className="stroke-current" />;
  else if (props.chevron && props.chevron === 'right')
    children = <ChevronRight size={20} className="stroke-current" />;
  else children = props.children;

  return (
    <button
      type="button"
      className={`${buttonClassName} ${props.className}`}
      style={props.style}
      onClick={props.onClick}
    >
      {children}
    </button>
  );
};

/**
 * Util functions
 */
/**
 * For formatting date
 * @param date
 */
function formattedDate(date: Date): string {
  if (!date) {
    return '';
  }
  return format(date, 'dd / MM / yyyy');
}

/**
 * Beginning of Day of Week of a Month
 * @param date
 */
function beginningDayOfWeek(m: number, y: number): number {
  return new Date(y, m, 1).getDay();
}

/**
 * Days in month
 */
function daysInMonth(month: number, year: number) {
  switch (month) {
    case 0:
    case 2:
    case 4:
    case 6:
    case 7:
    case 9:
    case 11:
      return 31;
    case 1:
      return isLeapYear(year) ? 29 : 28;
    default:
      return 30;
  }
}

/**
 * Is Leap Year
 * @param year
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
