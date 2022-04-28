/**
 * Generate Pagination with placeholder slots.
 * @param currentPage Current page number
 * @param totalPages Total pages
 * @param delta The nearby numbers distance.
 * @link https://gist.github.com/kottenator/9d936eb3e4e3c3e02598
 * @returns Array of pagination.
 */
export function generatePagination(currentPage, totalPages, delta = 1) {
  const left = currentPage - delta,
    right = currentPage + delta + 1,
    range = [],
    rangeWithDots = [];

  let l = 0;

  for (let i = 1; i <= totalPages; i++) {
    if (i == 1 || i == totalPages || (i >= left && i < right)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}
