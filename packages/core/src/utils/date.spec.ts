import { BANGKOK_TIMEZONE } from './constants';
import { convert2C2PFormatToUTCDate, dateToUTCDate } from './date';

describe('date', () => {
  describe('convert2C2PFormatToUTCDate', () => {
    it('should convert 2c2p format into utc date correctly', () => {
      const actual = convert2C2PFormatToUTCDate('20220119203312');

      expect(actual).toEqual(
        dateToUTCDate('2022-01-19T20:33:12.000', BANGKOK_TIMEZONE),
      );
    });

    it('should return undefined when unknown format is supplied', () => {
      expect(convert2C2PFormatToUTCDate('2021254456')).toEqual(undefined);
      expect(convert2C2PFormatToUTCDate('foo')).toEqual(undefined);
      expect(convert2C2PFormatToUTCDate('202125x456')).toEqual(undefined);
    });
  });
});
