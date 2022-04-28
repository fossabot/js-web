// eslint-disable-next-line no-restricted-imports
import { format as f, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { addDays, addMonths, addYears, isSameDay } from 'date-fns';
import * as dateFp from 'date-fns/fp';
import { flow } from 'lodash';
import { enUS, th } from 'date-fns/locale';
import {
  BANGKOK_TIMEZONE,
  DEFAULT_DATE_FORMAT,
  DEFAULT_TIMEZONE,
  UTC_TIMEZONE,
} from './constants';
import {
  DurationInterval,
  SubscriptionPlan,
} from '../payment/SubscriptionPlan.entity';
import { LanguageCode } from '../language/Language.entity';

export const formatWithTimezone = (
  date: Date,
  timeZone: string = DEFAULT_TIMEZONE,
  format: string = DEFAULT_DATE_FORMAT,
  language: LanguageCode = LanguageCode.EN,
): string => {
  return f(utcToZonedTime(date, timeZone), format, {
    timeZone,
    locale: language === LanguageCode.EN ? enUS : th,
  });
};

export const dateToISOString = (
  date: Date | string,
  timeZone: string = UTC_TIMEZONE,
): string => {
  return zonedTimeToUtc(date, timeZone).toISOString();
};

export const dateToUTCDate = (
  date: Date | string,
  timeZone: string = UTC_TIMEZONE,
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

export const addToDateByPlan = (date: Date, plan: SubscriptionPlan) => {
  return flow(
    dateFp.addDays(plan.periodDay),
    dateFp.addMonths(plan.periodMonth),
    dateFp.addYears(plan.periodYear),
  )(date);
};

/**
 * Convert string in format 'yyyyMMddHHmmss' to date in UTC
 * @param val
 */
export const convert2C2PFormatToUTCDate = (val: string): Date | undefined => {
  if (val.length !== 14 || Number.isNaN(val)) {
    return undefined;
  }

  const year = val.substring(0, 4);
  const month = val.substring(4, 6);
  const date = val.substring(6, 8);
  const hour = val.substring(8, 10);
  const minute = val.substring(10, 12);
  const second = val.substring(12, 14);
  return zonedTimeToUtc(
    `${year}-${month}-${date}T${hour}:${minute}:${second}.000`,
    BANGKOK_TIMEZONE,
  );
};

export const getDatePeriodString = (
  startDate?: Date | null,
  endDate?: Date | null,
) => {
  if (!startDate || !endDate) return { startDateString: '', endDateString: '' };
  const startDateString = formatWithTimezone(
    startDate,
    BANGKOK_TIMEZONE,
    'dd MMM yy HH:mm',
  );
  let endDateString = formatWithTimezone(
    endDate,
    BANGKOK_TIMEZONE,
    'dd MMM yy HH:mm',
  );

  if (isSameDay(startDate, endDate)) {
    endDateString = formatWithTimezone(endDate, BANGKOK_TIMEZONE, 'HH:mm');
  }

  return { startDateString, endDateString };
};
