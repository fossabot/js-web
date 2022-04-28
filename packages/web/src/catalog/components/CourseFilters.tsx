import cx from 'classnames';
import { useMemo } from 'react';
import useCourseFilters from '../hooks/useCourseFilters';
import useTranslation from '../../i18n/useTranslation';
import { CourseCategoryKey, CourseSubCategoryKey } from '../../models/course';
import InputCheckbox from '../../ui-kit/InputCheckbox';
import InputSelect from '../../ui-kit/InputSelect';
import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';

export default function CourseFilters() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    pathname,
    categoryKey,
    subCategoryKey,
    durationStart,
    durationEnd,
    language,
    hasCertificate,
    haveActiveFilters,
    assigned,
    required,
  } = useCourseFilters();
  const categoryValue = categoryKey || subCategoryKey;
  const learningStyles = useMemo(
    () => [
      { label: t('catalogList.allLearningStyles'), value: null },
      {
        label: t('catalogList.virtualAndFaceToFace'),
        value: CourseCategoryKey.LEARNING_EVENT,
        type: CourseCategoryKey,
      },
      {
        label: t('catalogList.onlineCourse'),
        value: CourseCategoryKey.ONLINE_LEARNING,
        type: CourseCategoryKey,
      },
      {
        label: t('catalogList.documents'),
        value: CourseSubCategoryKey.DOCUMENT,
        type: CourseSubCategoryKey,
      },
    ],
    [],
  );
  const durations = useMemo(
    () => [
      {
        label: t('catalogList.allDuration'),
        value: { durationStart: undefined, durationEnd: undefined },
      },
      {
        label: '< 10 min',
        value: { durationStart: undefined, durationEnd: 10 },
      },
      { label: '10 - 60 min', value: { durationStart: 10, durationEnd: 60 } },
      { label: '1 - 3 hr', value: { durationStart: 60, durationEnd: 180 } },
      {
        label: '> 3 hr',
        value: { durationStart: 180, durationEnd: undefined },
      },
    ],
    [],
  );
  const languages = useMemo(
    () => [
      { label: 'TH/EN', value: null },
      { label: 'EN', value: 'en' },
      { label: 'TH', value: 'th' },
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
    router.push(newUrl, undefined, { scroll: false, shallow: true });
  }

  function handeChangeCategory(key: string, value: string) {
    const query = {
      categoryKey: key === 'categoryKey' ? value : undefined,
      subCategoryKey: key === 'subCategoryKey' ? value : undefined,
    };
    reloadPage(query);
  }

  function handeChangeDuration({
    durationStart,
    durationEnd,
  }: {
    durationStart: number | undefined;
    durationEnd: number | undefined;
  }) {
    const query = {
      durationStart,
      durationEnd,
    };
    reloadPage(query);
  }

  function handleChange(...args: string[]) {
    const query: { [key: string]: string } = {};
    for (let i = 0; i < args.length; i += 2) {
      query[args[i]] = args[i + 1];
    }
    reloadPage(query);
  }

  function handleClear() {
    const query = {
      categoryKey: undefined,
      subCategoryKey: undefined,
      durationStart: undefined,
      durationEnd: undefined,
      language: undefined,
      hasCertificate: undefined,
      assigned: undefined,
      required: undefined,
    };
    reloadPage(query);
  }

  return (
    <>
      <div className="mb-3 flex w-full flex-col flex-wrap lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-1 flex-col lg:mr-2 lg:w-auto lg:flex-row">
          <InputSelect
            name="categoryKey"
            selectClassWrapperName="mr-1 flex-shrink"
            value={{
              label:
                learningStyles.find((it) => it.value === categoryValue)
                  ?.label || learningStyles[0].label,
              value: categoryValue,
            }}
            options={learningStyles}
            renderOptions={learningStyles}
            onChange={(e) => {
              const learningStyle = learningStyles.find(
                (it) => it.value === e.target.value,
              );
              handeChangeCategory(
                learningStyle.type === CourseCategoryKey
                  ? 'categoryKey'
                  : 'subCategoryKey',
                e.target.value,
              );
            }}
          />
          {categoryValue === CourseCategoryKey.ONLINE_LEARNING ? (
            <div className="w-80">
              <InputSelect
                name="duration"
                selectClassWrapperName="flex-shrink mt-2 lg:mt-0"
                value={{
                  label:
                    durations.find(
                      (it) =>
                        it.value?.durationStart === durationStart &&
                        it.value?.durationEnd === durationEnd,
                    )?.label || durations[0].label,
                  value: { durationStart, durationEnd },
                }}
                options={durations}
                renderOptions={durations}
                onChange={(e) => {
                  handeChangeDuration(e.target.value);
                }}
              />
            </div>
          ) : null}
        </div>
        <div className="mt-2 flex items-center lg:mt-0 lg:flex-shrink-0">
          <div className="w-25 lg:w-26">
            <InputSelect
              name="language"
              value={{
                label:
                  languages.find((it) => it.value === language)?.label ||
                  languages[0].label,
                value: language,
              }}
              options={languages}
              renderOptions={languages}
              onChange={(e) => {
                handleChange('language', e.target.value);
              }}
            />
          </div>
        </div>
      </div>
      <div className="mb-6 flex items-center space-x-4">
        <InputCheckbox
          name="hasCertificate"
          label={t('catalogList.certificate')}
          checked={hasCertificate === '1'}
          onChange={(e) => {
            handleChange('hasCertificate', e.target.checked ? '1' : undefined);
          }}
          inputWrapperClassName="font-semibold"
        />
        <InputCheckbox
          name="assigned"
          label={t('catalogList.assigned')}
          checked={assigned === '1'}
          onChange={(e) => {
            handleChange(
              'assigned',
              e.target.checked ? '1' : undefined,
              'required',
              undefined,
            );
          }}
          inputWrapperClassName="font-semibold"
        />
        <InputCheckbox
          name="required"
          label={t('catalogList.required')}
          checked={required === '1'}
          onChange={(e) => {
            handleChange(
              'required',
              e.target.checked ? '1' : undefined,
              'assigned',
              undefined,
            );
          }}
          inputWrapperClassName="font-semibold"
        />
        <div
          className={cx(
            'flex-shrink-0 cursor-pointer border-l border-gray-400 pl-4 text-caption font-semibold text-brand-primary lg:ml-3',
            haveActiveFilters ? 'opacity-1' : 'opacity-0',
          )}
          onClick={handleClear}
        >
          {t('catalogList.clear')}
        </div>
      </div>
    </>
  );
}
