import { format, isEqual } from 'date-fns';
import { ReactNode } from 'react';
import useTranslation from '../i18n/useTranslation';
import { DatePicker, IDatePickerProps } from './DatePicker/DatePicker';
import { Calendar, Close } from './icons';

type IInputDatePickerProps = Pick<
  IDatePickerProps,
  | 'startDate'
  | 'endDate'
  | 'allowedDates'
  | 'disabledDates'
  | 'minDate'
  | 'maxDate'
  | 'error'
  | 'changeCalendarBy'
  | 'size'
  | 'withTime'
  | 'onChange'
  | 'clearable'
  | 'overrideShowDateRange'
> & {
  inputError?: any;
  label?: ReactNode;
  placeholder?: ReactNode;
  onBlur?: () => void;
};

export const InputDatePicker = (props: IInputDatePickerProps) => {
  const { t } = useTranslation();
  const dateFormat = props.withTime ? 'dd MMM yyyy HH:mm' : 'dd MMM yyyy';

  return (
    <div className="flex flex-col">
      {props.label && (
        <label className="mb-2 text-caption font-semibold">{props.label}</label>
      )}
      <DatePicker
        {...props}
        size={props.size || 'small'}
        closeCalendarOnChange={false}
      >
        {({ ref, showCalendar }) => (
          <div
            ref={ref}
            className="flex w-full items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2"
            onClick={() => {
              showCalendar();
            }}
            onBlur={() => {
              props.onBlur?.();
            }}
          >
            <Calendar />
            {props.startDate && (
              <span className="flex-1 font-semibold">
                {!props.endDate || isEqual(props.startDate, props.endDate)
                  ? format(props.startDate, dateFormat)
                  : `${format(props.startDate, dateFormat)} - ${format(
                      props.endDate,
                      dateFormat,
                    )}`}
              </span>
            )}
            {!props.startDate && props.placeholder && (
              <span>{props.placeholder}</span>
            )}
            {props.startDate && props.clearable && (
              <Close
                className="block cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  props.onChange([null, null]);
                }}
              />
            )}
          </div>
        )}
      </DatePicker>
      {props.inputError ? (
        <p className="pt-2 text-footnote text-red-200">{t(props.inputError)}</p>
      ) : null}
    </div>
  );
};
