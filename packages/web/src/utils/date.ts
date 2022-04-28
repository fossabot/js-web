// eslint-disable-next-line no-restricted-imports
import { format as f, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import {
  addDays,
  addMonths,
  addYears,
  formatDuration,
  intervalToDuration,
} from 'date-fns';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_TIMEZONE,
  DEFAULT_TIMEZONE_GMT,
  DurationInterval,
} from '../constants/datetime';
import {
  differenceInMinutes,
  format,
  isToday,
  formatDistanceToNow,
} from 'date-fns';
import { enUS, th } from 'date-fns/locale';

export const formatWithTimezone = (
  date: Date,
  format: string = DEFAULT_DATE_FORMAT,
  timeZone: string = DEFAULT_TIMEZONE,
): string => {
  return f(utcToZonedTime(date, timeZone), format, {
    timeZone,
  });
};

export const dateToISOString = (
  date: Date | string,
  timeZone: string = DEFAULT_TIMEZONE,
): string => {
  return zonedTimeToUtc(date, timeZone).toISOString();
};

export const dateToUTCDate = (
  date: Date | string,
  timeZone: string = DEFAULT_TIMEZONE,
): Date => {
  return zonedTimeToUtc(date, timeZone);
};

export const addToDate = (
  date: Date,
  type: DurationInterval | string,
  amount: number,
): Date => {
  switch (type) {
    case DurationInterval.DAY:
      return addDays(date, amount);
    case DurationInterval.MONTH:
      return addMonths(date, amount);
    case DurationInterval.YEAR:
      return addYears(date, amount);
    default:
      return date;
  }
};

const formatDistanceLocale = {
  xSeconds: '{{count}}s',
  xMinutes: '{{count}}m',
  xHours: '{{count}}h',
};
const shortEnLocale = {
  formatDistance: (token, count) =>
    formatDistanceLocale[token].replace('{{count}}', count),
};
export function getMediaDurationText(seconds: number) {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  return formatDuration(duration, {
    format: ['hours', 'minutes', 'seconds'],
    locale: shortEnLocale,
  });
}

export const formatDateChunks = (
  date: string,
  month: string,
  year: string,
  time: string,
  timezone = DEFAULT_TIMEZONE_GMT,
) => {
  const dateString = `${year}-${month}-${date} ${time} ${timezone}`;
  return new Date(dateString).toISOString();
};

export const formatDateWithLocale = (
  locale: string | undefined,
  date: Date | string,
  formatEn = 'MMM dd, yyyy',
  formatTh = 'dd MMM yyyy',
) => {
  return format(new Date(date), locale === 'th' ? formatTh : formatEn, {
    locale: locale === 'th' ? th : enUS,
  });
};
