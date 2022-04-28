import 'reflect-metadata';
// eslint-disable-next-line no-restricted-imports
import { endOfDay, fromUnixTime } from 'date-fns';
import { plainToClass } from 'class-transformer';
import { PeriodQuery } from '../period-query.dto';

describe('PeriodQuery', () => {
  it('has expected default value, given empty object', () => {
    const emptyPeriodQuery = plainToClass(PeriodQuery, {});
    const now = new Date();

    expect(emptyPeriodQuery.fromDate).toEqual(fromUnixTime(0));
    expect(emptyPeriodQuery.toDate).toEqual(endOfDay(now));
  });

  it('has expected default value, given random string', () => {
    const now = new Date();
    const invalidPeriodQuery = plainToClass(PeriodQuery, {
      fromDate: 'randomString',
      toDate: 'anotherRandomString',
    });

    expect(invalidPeriodQuery.fromDate).toEqual(fromUnixTime(0));
    expect(invalidPeriodQuery.toDate).toEqual(endOfDay(now));
  });

  it('has expected date value for a given object', () => {
    const { fromDate, toDate } = plainToClass(PeriodQuery, {
      fromDate: '-1',
      toDate: '1',
    });

    expect(fromDate).toEqual(fromUnixTime(-1));
    expect(toDate).toEqual(fromUnixTime(1));
  });
});
