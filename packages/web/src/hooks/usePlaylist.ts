import { pullAt, inRange } from 'lodash';

export function usePlaylist<T>(playlist: T[]) {
  const clone = [...playlist]; // to prevent reference mutation

  function add(element: T) {
    return playlist.concat(element);
  }

  function remove(index: number) {
    pullAt(clone, [index]);

    return clone;
  }

  function swap(srcIndex: number, destIndex: number) {
    if (
      !inRange(srcIndex, 0, clone.length) ||
      !inRange(destIndex, 0, clone.length)
    ) {
      return clone;
    }
    const source = clone[srcIndex];
    const dest = clone[destIndex];

    clone[destIndex] = source;
    clone[srcIndex] = dest;

    return clone;
  }

  function stepUp(index: number) {
    return swap(index, index - 1);
  }

  function stepDown(index: number) {
    return swap(index, index + 1);
  }

  return {
    add,
    remove,
    stepUp,
    stepDown,
  };
}
