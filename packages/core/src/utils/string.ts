export function sluggerFilter(name: string) {
  return name
    .toString()
    .toLowerCase()
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\p{Letter}\p{Nd}]+/gu, '-') // Replace non-letter/non-number characters with -
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}
