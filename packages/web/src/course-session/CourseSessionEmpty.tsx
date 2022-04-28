import { MutableRefObject } from 'react';
import useTranslation from '../i18n/useTranslation';
import Picture from '../ui-kit/Picture';

interface ICourseSessionEmptyProps {
  hasFilters: boolean;
  showCalendarButtonRef?: MutableRefObject<HTMLButtonElement>;
}

export const CourseSessionEmpty = ({
  hasFilters,
  showCalendarButtonRef,
}: ICourseSessionEmptyProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 p-24 text-center">
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
      <h6 className="mt-1 text-subheading font-semibold">
        {t('courseSessionsPage.noSessionsAvailable')}
      </h6>
      {!hasFilters ? (
        <a
          type="button"
          className="mt-5 text-caption font-semibold text-brand-primary"
          onClick={() => {
            showCalendarButtonRef?.current.click();
          }}
        >
          {t('courseSessionsPage.findAnotherDate')}
        </a>
      ) : (
        <p className="mt-5 text-caption text-gray-650">
          {t('courseSessionsPage.tryRemoveFilters')}
        </p>
      )}
    </div>
  );
};
