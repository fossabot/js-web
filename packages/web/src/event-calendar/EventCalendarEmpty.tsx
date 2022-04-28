import useTranslation from '../i18n/useTranslation';
import Picture from '../ui-kit/Picture';

export interface IEventCalendarEmptyProps {
  hasFilters: boolean;
  onClear: () => void;
}

export const EventCalendarEmpty = ({
  hasFilters,
  onClear,
}: IEventCalendarEmptyProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-gray-100 p-10 text-center">
      <Picture
        sources={[
          {
            srcSet: '/assets/empty.webp',
            type: 'image/webp',
          },
        ]}
        fallbackImage={{
          src: '/assets/empty.png',
        }}
      />

      <h4 className="text-heading font-semibold">
        {t('eventCalendarPage.noSessionsAvailable')}
      </h4>
      {hasFilters && (
        <a
          role="button"
          onClick={onClear}
          className="font-semibold text-brand-primary"
        >
          {t('eventCalendarPage.clearAllFilters')}
        </a>
      )}
    </div>
  );
};
