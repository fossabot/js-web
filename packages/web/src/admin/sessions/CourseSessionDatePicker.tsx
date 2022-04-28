import { endOfDay, startOfDay } from 'date-fns';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';
import { DatePicker } from '../../ui-kit/DatePicker/DatePicker';

function CourseSessionDatePicker() {
  const { t } = useTranslation();
  const router = useRouter();

  async function onDateChange(range: [Date, Date]) {
    const startTime = startOfDay(range[0]);
    const endTime = endOfDay(range[0]);
    const url = `${WEB_PATHS.SESSION_MANAGEMENT}?startTime=${encodeURIComponent(
      startTime.toJSON(),
    )}&endTime=${encodeURIComponent(endTime.toJSON())}`;
    router.push(url);
  }

  const today = useMemo(() => startOfDay(new Date()), []);

  return (
    <DatePicker
      startDate={today}
      onChange={onDateChange}
      size="small"
      closeCalendarOnChange={true}
    >
      {({ ref, showCalendar }) => (
        <div
          ref={ref}
          onClick={showCalendar}
          className="mt-2 cursor-pointer text-caption font-semibold text-brand-primary"
        >
          {t('sessionParticipantManagementPage.change')}
        </div>
      )}
    </DatePicker>
  );
}

export default CourseSessionDatePicker;
