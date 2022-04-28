export const getDurationText = (
  {
    durationMonths,
    durationWeeks,
    durationDays,
    durationHours,
    durationMinutes,
  }: {
    durationMonths?: number;
    durationWeeks?: number;
    durationDays?: number;
    durationHours?: number;
    durationMinutes?: number;
  },
  t: (arg: string) => string,
) => {
  const chunks = [
    durationMonths
      ? `${durationMonths}${
          durationMonths > 1
            ? t('courseDetailPage.durationText.months')
            : t('courseDetailPage.durationText.month')
        }`
      : null,
    durationWeeks
      ? `${durationWeeks}${
          durationWeeks > 1
            ? t('courseDetailPage.durationText.weeks')
            : t('courseDetailPage.durationText.week')
        }`
      : null,
    durationDays
      ? `${durationDays}${
          durationDays > 1
            ? t('courseDetailPage.durationText.days')
            : t('courseDetailPage.durationText.day')
        }`
      : null,
    durationHours
      ? `${durationHours}${
          durationHours > 1
            ? t('courseDetailPage.durationText.hours')
            : t('courseDetailPage.durationText.hour')
        }`
      : null,
    durationMinutes
      ? `${durationMinutes}${
          durationMinutes > 1
            ? t('courseDetailPage.durationText.minutes')
            : t('courseDetailPage.durationText.minute')
        }`
      : null,
  ].filter((c) => !!c);

  return chunks.slice(0, 2).join(' ').trim();
};
