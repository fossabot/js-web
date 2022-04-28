import { addYears, format, setMonth } from 'date-fns';
import { monthNames } from '../../constants/datetime';
import { ChevronRight } from '../icons';
import { CalendarView } from './DatePickerCalendar';

type IDatePickerCalendarMonthsProps = {
  calendarDate: Date;
  setCalendarDate: (date: Date) => void;
  setCalendarView: (view: CalendarView) => void;
};

export const DatePickerCalendarMonths = ({
  calendarDate,
  setCalendarDate,
  setCalendarView,
}: IDatePickerCalendarMonthsProps) => {
  return (
    <div>
      <div className="flex overflow-hidden rounded-lg border border-gray-300">
        <button
          type="button"
          className="outline-none focus:outline-none border-r border-gray-200 bg-gray-100 py-3 px-2 active:bg-gray-200"
          onClick={() => setCalendarDate(addYears(calendarDate, -1))}
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
            {format(calendarDate, 'yyyy')}
          </button>
        </div>
        <button
          type="button"
          className="outline-none focus:outline-none border-l border-gray-200 bg-gray-100 py-3 px-2 active:bg-gray-200"
          onClick={() => setCalendarDate(addYears(calendarDate, 1))}
        >
          <ChevronRight className="text-gray-400" />
        </button>
      </div>
      <div
        className="mt-6 grid grid-rows-3 gap-4"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        {monthNames.map((month, i) => (
          <button
            onClick={() => {
              setCalendarDate(setMonth(calendarDate, i));
              setCalendarView('dates');
            }}
            type="button"
            className="p-2 font-bold"
            key={month}
          >
            {month.slice(0, 3)}
          </button>
        ))}
      </div>
    </div>
  );
};
