import { getAveragePercentage } from './math';

describe('math', () => {
  describe('getAveragePercentage', () => {
    it('should return valid average percentage with percentage array.', () => {
      const percentageArray = [20, 30, 35, 45, 15, 25, 60, 80, 95, 47];
      const actual = getAveragePercentage(percentageArray);
      const expected = 46;
      expect(actual).toEqual(expected);
    });

    it('should not more than 100 percent', () => {
      const percentageArray = [120, 100, 200];
      const actual = getAveragePercentage(percentageArray);
      const expected = 100;
      expect(actual).toEqual(expected);
    });

    it('should not less than 0 percent', () => {
      const percentageArray = [-20, -100, -200];
      const actual = getAveragePercentage(percentageArray);
      const expected = 0;
      expect(actual).toEqual(expected);
    });

    it('should return integer', () => {
      const percentageArray = [22.22, 22.22, 22.22];
      const actual = getAveragePercentage(percentageArray);
      const expected = 23;
      expect(actual).toEqual(expected);
    });

    it('should ceiling decimal to interger', () => {
      const percentageArray = [99.99, 99.99, 99.99];
      const actual = getAveragePercentage(percentageArray);
      const expected = 100;
      expect(actual).toEqual(expected);
    });

    it('should return 0 if provide empty array', () => {
      const percentageArray: number[] = [];
      const actual = getAveragePercentage(percentageArray);
      const expected = 0;
      expect(actual).toEqual(expected);
    });
  });
});
