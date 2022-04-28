import cx from 'classnames';
import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';

import InputSelect from '../ui-kit/InputSelect';
import useTranslation from '../i18n/useTranslation';
import useLearningTrackFilters from './useLearningTrackFilters';
import InputCheckbox from '../ui-kit/InputCheckbox';

export default function LearningTrackFilters() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    category,
    topicId,
    pathname,
    hasCertificate,
    hasActiveFilters,
    assigned,
  } = useLearningTrackFilters();

  const categories = useMemo(
    () => [
      { label: t('learningTrackListPage.allTypes'), value: undefined },
      {
        label: t('learningTrackListPage.blended'),
        value: 'BLENDED',
      },
      {
        label: t('learningTrackListPage.onlineOnly'),
        value: 'ONLINE_ONLY',
      },
    ],
    [],
  );

  function reloadPage(query) {
    const newUrl = stringifyUrl({
      url: pathname,
      query: {
        ...router.query,
        ...query,
      },
    });

    router.push(newUrl, undefined, { scroll: false });
  }

  function handleCategoryChange(value: string) {
    const query = {
      ...router.query,
      category: value,
    };
    reloadPage(query);
  }

  function handleCertificateChange(value: string) {
    const query = {
      ...router.query,
      hasCertificate: value,
    };
    reloadPage(query);
  }

  function handleAssignedChange(value: string) {
    const query = {
      ...router.query,
      assigned: value,
    };
    reloadPage(query);
  }

  function handleClear() {
    const query = {
      topicId,
      hasCertificate: undefined,
      category: undefined,
    };

    reloadPage(query);
  }

  return (
    <>
      <div className="mb-3 flex w-full flex-col flex-wrap lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-1 flex-col lg:mr-2 lg:w-auto lg:flex-row">
          <InputSelect
            name="category"
            selectClassWrapperName="flex-shrink mt-2 lg:mt-0"
            value={{
              label:
                categories.find((c) => c.value === category)?.label ||
                categories[0].label,
              value: category,
            }}
            options={categories}
            renderOptions={categories}
            onChange={(e) => {
              handleCategoryChange(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="mb-6 flex items-center space-x-4">
        <InputCheckbox
          name="hasCertificate"
          label={t('learningTrackListPage.certificate')}
          checked={hasCertificate === '1'}
          onChange={(e) => {
            handleCertificateChange(e.target.checked ? '1' : undefined);
          }}
          inputWrapperClassName="font-semibold"
        />
        <InputCheckbox
          name="assigned"
          label={t('catalogList.assigned')}
          checked={assigned === '1'}
          onChange={(e) => {
            handleAssignedChange(e.target.checked ? '1' : undefined);
          }}
          inputWrapperClassName="font-semibold"
        />

        <div
          className={cx(
            'flex-shrink-0 cursor-pointer border-l border-gray-400 pl-4 text-caption font-semibold text-brand-primary lg:ml-3',
            hasActiveFilters ? 'opacity-1' : 'opacity-0',
          )}
          onClick={handleClear}
        >
          {t('clear')}
        </div>
      </div>
    </>
  );
}
