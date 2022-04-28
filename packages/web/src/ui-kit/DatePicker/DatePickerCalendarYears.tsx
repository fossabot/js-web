import { addYears, format, setYear } from 'date-fns';
import { ChevronRight } from '../icons';
import { CalendarView } from './DatePickerCalendar';

type IDatePickerCalendarYearsProps = {
  calendarDate: Date;
  setCalendarDate: (date: Date) => void;
  setCalendarView: (view: CalendarView) => void;
};

export const DatePickerCalendarYears = ({
  calendarDate,
  setCalendarDate,
  setCalendarView,
}: IDatePickerCalendarYearsProps) => {
  return (
    <div>
      <div className="flex overflow-hidden rounded-lg border border-gray-300">
        <button
          type="button"
          className="outline-none focus:outline-none border-r border-gray-200 bg-gray-100 py-3 px-2 active:bg-gray-200"
          onClick={() => setCalendarDate(addYears(calendarDate, -12))}
        >
          <ChevronRight
            className="text-gray-400"
            style={{ transform: 'rotateZ(180deg)' }}
          />
        </button>

        <div className="flex flex-1 items-center justify-center space-x-1 bg-white">
          <button
            type="button"
            className="rounded py-1 px-2 hover:bg-gray-200"
            onClick={() => setCalendarView('years')}
          >
            {format(calendarDate, 'yyyy')} -{' '}
            {format(addYears(calendarDate, 12), 'yyyy')}
          </button>
        </div>
        <button
          type="button"
          className="outline-none focus:outline-none border-l border-gray-200 bg-gray-100 py-3 px-2 active:bg-gray-200"
          onClick={() => setCalendarDate(addYears(calendarDate, 12))}
        >
          <ChevronRight className="text-gray-400" />
        </button>
      </div>
      <div
        className="mt-6 grid grid-rows-3 gap-4"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <button
            onClick={() => {
              setCalendarDate(
                setYear(calendarDate, calendarDate.getFullYear() + index),
              );
              setCalendarView('months');
            }}
            type="button"
            className="p-2 font-bold"
            key={index}
          >
            {calendarDate.getFullYear() + index}
          </button>
        ))}
      </div>
    </div>
  );
};
