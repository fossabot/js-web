import { addMinutes, differenceInSeconds, isAfter, isBefore } from 'date-fns';

export function useCourseSessionDateTime(startAt: Date, endAt: Date) {
  const now = new Date();
  const timePadding = addMinutes(startAt, -15);

  function isEnded() {
    return isAfter(now, endAt);
  }

  function joinable() {
    return isAfter(now, timePadding) && isBefore(now, endAt);
  }

  function willStart() {
    return isBefore(now, timePadding) && isBefore(now, endAt);
  }

  function isSoon() {
    return isAfter(now, timePadding) && isBefore(now, startAt);
  }

  function inProgress() {
    return isAfter(now, startAt) && isBefore(now, endAt);
  }

  function willStartRemainingSeconds() {
    return differenceInSeconds(timePadding, now);
  }

  function soonRemainingSeconds() {
    return differenceInSeconds(startAt, now);
  }

  function inProgressRemainingSeconds() {
    return differenceInSeconds(endAt, now);
  }

  return {
    isEnded: isEnded(),
    joinable: joinable(),
    willStart: willStart(),
    isSoon: isSoon(),
    inProgress: inProgress(),
    startAt,
    endAt,
    willStartRemainingSeconds,
    inProgressRemainingSeconds,
    soonRemainingSeconds,
  };
}
