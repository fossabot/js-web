import { Placement } from '@popperjs/core';
import { format, isBefore, isEqual } from 'date-fns';
import {
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Manager, Popper, Reference } from 'react-popper';
import { usePrevious } from '../../hooks/usePrevious';
import { formatWithTimezone } from '../../utils/date';
import { Calendar, Close } from '../icons';
import InputSection, { IInputSection } from '../InputSection';
import { DatePickerCalendar } from './DatePickerCalendar';

export interface IDatePickerProps {
  startDate: Date;
  endDate?: Date;
  overrideShowDateRange?: boolean;
  onChange: (range: [Date | null, Date | null]) => void;
  clearable?: boolean;
  allowedDates?: { [date: number]: true } | ((date: Date) => boolean);
  disabledDates?: ((date: Date) => boolean) | { [date: number]: true } | 'all';
  inputSectionProps?: Partial<IInputSection>;
  children?: (props: {
    ref: Ref<any>;
    showCalendar: () => void;
    isShowingCalendar: boolean;
  }) => ReactNode;
  placement?: Placement;
  error?: (calendarMonth: Date) => ReactNode;
  closeCalendarOnChange?: boolean;
  minDate?: Date;
  maxDate?: Date;
  changeCalendarBy?: 'month-and-year' | 'month';
  withTimezone?: boolean;
  size?: 'small' | 'large';
  portalElement?: HTMLElement;
  withTime?: boolean;
}

export const DatePicker = ({
  startDate,
  endDate,
  clearable,
  onChange,
  inputSectionProps,
  children,
  placement = 'bottom-start',
  error,
  closeCalendarOnChange = true,
  disabledDates,
  allowedDates,
  minDate,
  maxDate,
  changeCalendarBy = 'month-and-year',
  withTimezone = true,
  size,
  portalElement,
  withTime = false,
  overrideShowDateRange = false,
}: IDatePickerProps) => {
  const [isShowingCalendar, setIsShowingCalendar] = useState(false);
  const prevIsShowingCalendar = usePrevious(isShowingCalendar);
  const popupNode = useRef<HTMLElement>(null);

  // placeholder state before committing to parent changes
  const [startDateState, setStartDateState] = useState(startDate);
  const [endDateState, setEndDateState] = useState(endDate);

  // reflect outer state once calendar is closed
  useEffect(() => {
    if (
      (!isEqual(startDateState, startDate) ||
        (endDate && !isEqual(endDateState, endDate))) &&
      !isShowingCalendar &&
      isShowingCalendar !== prevIsShowingCalendar
    ) {
      const [_start, _end] =
        !endDateState || isBefore(startDateState, endDateState)
          ? [startDateState, endDateState]
          : [endDateState, startDateState];
      onChange([_start || null, _end || null]);
    }
  }, [isShowingCalendar, prevIsShowingCalendar]);

  // reflect changes from parent state
  useEffect(() => {
    setStartDateState(startDate);
  }, [startDate]);

  useEffect(() => {
    setEndDateState(endDate);
  }, [endDate]);

  useEffect(() => {
    function mouseDownListener(e: MouseEvent) {
      if (popupNode.current && !popupNode.current.contains(e.target as Node)) {
        setIsShowingCalendar(false);
      }
    }

    if (isShowingCalendar) {
      document.addEventListener('mousedown', mouseDownListener);
    }

    return () => {
      document.removeEventListener('mousedown', mouseDownListener);
    };
  }, [isShowingCalendar]);

  const onChangeStartDate = useCallback(
    (date: Date) => {
      setStartDateState((startDateState) => {
        if (startDateState?.getTime() === date.getTime()) {
          // don't set end date state if no initial end date was provided,
          // meaning, it's not a date range picker
          setEndDateState((endDateState) =>
            endDateState ? date : endDateState,
          );
        }
        return date;
      });
      if (closeCalendarOnChange) {
        setIsShowingCalendar(false);
      }
    },
    [closeCalendarOnChange],
  );

  const onChangeEndDate = useCallback(
    (date: Date) => {
      setEndDateState((endDateState) => {
        if (endDateState?.getTime() === date.getTime()) {
          setStartDateState(date);
        }
        return date;
      });
      if (closeCalendarOnChange) {
        setIsShowingCalendar(false);
      }
    },
    [closeCalendarOnChange],
  );

  const ClearIcon = (
    <Close
      className="block cursor-pointer"
      onClick={() => onChange([null, null])}
    />
  );

  const dateFormatter = withTimezone ? formatWithTimezone : format;

  const calendar = (ref, style) => (
    <DatePickerCalendar
      ref={ref as React.Ref<HTMLDivElement>}
      {...{
        startDate: startDateState,
        endDate: endDateState,
        disabledDates,
        allowedDates,
        onChangeStartDate,
        onChangeEndDate,
        error,
        minDate,
        maxDate,
        placement,
        style,
        changeCalendarBy,
        size,
        withTime,
        overrideShowDateRange,
      }}
    />
  );

  useEffect(() => {
    if (isShowingCalendar) {
      setTimeout(() => {
        popupNode.current?.focus();
      });
    }
  }, [isShowingCalendar]);

  return (
    <Manager>
      <Reference>
        {({ ref }) =>
          children ? (
            children({
              ref,
              showCalendar: () => setIsShowingCalendar(true),
              isShowingCalendar,
            })
          ) : (
            <div className="flex" ref={ref}>
              <InputSection
                name=""
                type="text"
                placeholder="DD / MM / YYYY"
                onFocus={() => setIsShowingCalendar(true)}
                value={startDate && dateFormatter(startDate, 'dd / MM / yyyy')}
                iconRight={clearable && startDate ? ClearIcon : Calendar}
                readOnly
                {...inputSectionProps}
              />
            </div>
          )
        }
      </Reference>
      <Popper
        placement={placement}
        innerRef={(node) => (popupNode.current = node)}
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 22],
            },
          },
        ]}
      >
        {({ ref, style }) =>
          isShowingCalendar &&
          (portalElement
            ? createPortal(calendar(ref, style), portalElement)
            : calendar(ref, style))
        }
      </Popper>
    </Manager>
  );
};
