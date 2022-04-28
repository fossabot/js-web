import { Transform, Type } from 'class-transformer';
// eslint-disable-next-line no-restricted-imports
import { fromUnixTime, endOfDay } from 'date-fns';

function transformToDate(value: unknown, defaultDate: Date) {
  const number = parseInt(value as string, 10);
  if (!number) {
    return defaultDate;
  }

  return fromUnixTime(number);
}

export class PeriodQuery {
  @Type(() => String)
  @Transform(({ value }) => transformToDate(value, fromUnixTime(0)))
  fromDate: Date = fromUnixTime(0);

  @Type(() => String)
  @Transform(({ value }) => transformToDate(value, endOfDay(new Date())))
  toDate: Date = endOfDay(new Date());
}
