import { createEvent, DateArray, EventAttributes } from 'ics';
import { UTC_TIMEZONE } from './constants';
import { formatWithTimezone } from './date';

export const generateICScalendar = async (
  startDateTime: Date,
  endDateTime: Date,
  eventAttributes: Omit<
    EventAttributes,
    'start' | 'endInputType' | 'startInputType'
  >,
): Promise<string> => {
  const { title, ...attributes } = eventAttributes;

  return new Promise((resolve, reject) =>
    createEvent(
      {
        title,
        start: formatWithTimezone(
          startDateTime,
          UTC_TIMEZONE,
          'yyyy-M-dd-HH-mm',
        )
          .split('-')
          .map((x) => parseInt(x, 10)) as DateArray,
        startInputType: 'utc',
        end: formatWithTimezone(endDateTime, UTC_TIMEZONE, 'yyyy-M-dd-HH-mm')
          .split('-')
          .map((x) => parseInt(x, 10)) as DateArray,
        endInputType: 'utc',
        ...attributes,
      },
      (error, value) => {
        if (error) reject(error);
        else resolve(value);
      },
    ),
  );
};
