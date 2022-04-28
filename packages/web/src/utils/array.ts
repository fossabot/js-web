export function flatten(data, childrenKey) {
  return data.reduce(
    (arr, item) => arr.concat([item], flatten(item[childrenKey], childrenKey)),
    [],
  );
}

/**
 * Helper to produce an array of enum values.
 */
export function enumToArray<T>(enumeration: T) {
  return Object.keys(enumeration)
    .filter((key) => isNaN(Number(key)))
    .map((key) => enumeration[key])
    .filter((val) => typeof val === 'number' || typeof val === 'string');
}

export function swapElement(arr, currentIndex, newIndex) {
  if (newIndex >= arr.length - 1) {
    newIndex = arr.length - 1;
  } else if (newIndex < 0) {
    newIndex = 0;
  }
  const newArr = [...arr];
  [newArr[currentIndex], newArr[newIndex]] = [
    newArr[newIndex],
    newArr[currentIndex],
  ];
  return newArr;
}
