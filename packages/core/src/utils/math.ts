/**
 * Get average percentage, and keep percent in range between 0 - 100. Decimal will add up to integer.
 * @param percentageArray Array of percentage.
 * @returns Calculated average percentage.
 */
export function getAveragePercentage(percentageArray: number[]) {
  const sum = percentageArray
    .map((n) => {
      if (n > 100) {
        return 100;
      }
      if (n < 0) {
        return 0;
      }
      return n;
    })
    .reduce((prev, current) => prev + current, 0);

  if (sum > 0) {
    return Math.ceil(sum / percentageArray.length);
  }
  return 0;
}
