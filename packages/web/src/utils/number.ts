/**
 * Try to parse object to integer.
 * @param value Value that you want to parse to integer
 * @returns Parsed Integer
 */
export function safeParseInt(value: any) {
  return parseInt(value) || 0;
}

/**
 * Get display price.
 * @param num Number that want to get the formatted text.
 * @param minimumFractionDigits Number of decimals include in formatted text
 * @returns Formatted text for display price.
 */
export function formatPrice(num: number, minimumFractionDigits = 2) {
  return num.toLocaleString('en-US', { minimumFractionDigits });
}
