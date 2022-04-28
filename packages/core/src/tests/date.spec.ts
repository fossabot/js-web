import { dateToISOString, addToDate, formatWithTimezone } from '../utils/date';

describe('Date utility functions', () => {
  // NOTED: In case we received time from AR/CRM that in different timezone from the server
  it('If date object is considered in GMT+2 it should return correct UTC time', () => {
    const date = new Date('4 June 2021 15:00:00');

    console.table([
      {
        'Current ISOString': date,
        'ISOString if server is in Asia/Bangkok': new Date(
          dateToISOString(date),
        ),
        'ISOString if server is in Asia/Singapore': new Date(
          dateToISOString(date, 'Asia/Singapore'),
        ),
        'ISOString if server is in Europe/Paris': new Date(
          dateToISOString(date, 'Europe/Paris'),
        ),
      },
    ]);

    expect(date.toISOString()).not.toEqual(
      dateToISOString(date, 'Europe/Paris'),
    );
  });

  it('Given a standardized time,function should be able to generate format with different timezone', () => {
    // Given a standardized time
    const date = new Date('2021-06-04T08:00:00.000Z');
    const bk = formatWithTimezone(date, 'Asia/Bangkok');
    const sg = formatWithTimezone(date, 'Asia/Singapore');
    const pr = formatWithTimezone(date, 'Europe/Paris');

    console.table([
      {
        'Current Format': formatWithTimezone(date),
        'Format in Asia/Bangkok timezone': bk,
        'Format in Asia/Singapore timezone': sg,
        'Format in Europe/Paris timezone': pr,
      },
    ]);

    expect(bk).toBe('4 Jun 2021 15:00:00');
    expect(sg).toBe('4 Jun 2021 16:00:00');
    expect(pr).toBe('4 Jun 2021 10:00:00');
  });

  it('Add days function', () => {
    // Given a standardized time
    const date = new Date('2021-06-04T08:00:00.000Z');
    const threeDays = addToDate(date, 'day', 3);
    const twoMonths = addToDate(date, 'month', 2);
    const oneYear = addToDate(date, 'year', 1);

    expect(threeDays.toISOString()).toBe('2021-06-07T08:00:00.000Z');
    expect(twoMonths.toISOString()).toBe('2021-08-04T08:00:00.000Z');
    expect(oneYear.toISOString()).toBe('2022-06-04T08:00:00.000Z');
  });
});
