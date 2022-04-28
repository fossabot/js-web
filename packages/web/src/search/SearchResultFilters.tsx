import cx from 'classnames';
import { useMemo } from 'react';

import InputSelect from '../ui-kit/InputSelect';
import useTranslation from '../i18n/useTranslation';
import InputCheckbox from '../ui-kit/InputCheckbox';
import { CourseCategoryKey } from '../models/course';
import { LearningWayKey } from '../models/learning-way';
import useSearchResultFilters from './useSearchResultFilters';
import { searchTypes } from '../ui-kit/headers/useSearchBar';

export default function SearchResultFilters() {
  const { t } = useTranslation();
  const {
    durationStart,
    durationEnd,
    language,
    myCourse,
    hasCertificate,
    requiredCourse,
    assignedCourse,
    assignedLearningTrack,
    lineOfLearning,
    courseCategory,
    myLearningTrack,
    type,
    handleClear,
    reloadPage,
  } = useSearchResultFilters();

  const durations = useMemo(
    () => [
      {
        label: t('searchResultPage.allDurations'),
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

  return (
    <div className="mb-6 flex w-full flex-col flex-wrap lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-full flex-1 flex-row lg:mr-2 lg:w-auto">
        <div className="mr-2 w-25 lg:w-25.5">
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
        {courseCategory === CourseCategoryKey.ONLINE_LEARNING ||
        lineOfLearning === LearningWayKey.ONLINE ? (
          <div className="w-44">
            <InputSelect
              name="duration"
              selectClassWrapperName="flex-shrink"
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
      <div className="mt-3 flex items-center lg:mt-0 lg:flex-shrink-0">
        <div className="mr-4 flex-shrink-0 font-semibold">
          <InputCheckbox
            name="hasCertificate"
            label={t('searchResultPage.certificate')}
            checked={hasCertificate === '1'}
            onChange={(e) => {
              handleChange(
                'hasCertificate',
                e.target.checked ? '1' : undefined,
              );
            }}
          />
        </div>

        {type !== searchTypes.LEARNING_TRACK && (
          <>
            <div className="mr-4 flex-shrink-0 font-semibold">
              <InputCheckbox
                name="requiredCourse"
                label={t('searchResultPage.required')}
                checked={requiredCourse === '1'}
                onChange={(e) => {
                  handleChange(
                    'requiredCourse',
                    e.target.checked ? '1' : undefined,
                    'assignedCourse',
                    undefined,
                  );
                }}
              />
            </div>
            <div className="mr-4 flex-shrink-0 font-semibold">
              <InputCheckbox
                name="assignedCourse"
                label={t('searchResultPage.assigned')}
                checked={assignedCourse === '1'}
                onChange={(e) => {
                  handleChange(
                    'assignedCourse',
                    e.target.checked ? '1' : undefined,
                    'requiredCourse',
                    undefined,
                  );
                }}
              />
            </div>
          </>
        )}
        {type === searchTypes.LEARNING_TRACK && (
          <>
            <div className="mr-4 flex-shrink-0 font-semibold">
              <InputCheckbox
                name="learningTrackAssigned"
                label={t('searchResultPage.assigned')}
                checked={assignedLearningTrack === '1'}
                onChange={(e) => {
                  handleChange(
                    'assignedLearningTrack',
                    e.target.checked ? '1' : undefined,
                  );
                }}
              />
            </div>
          </>
        )}
        <div className="flex-shrink-0 font-semibold">
          {type !== searchTypes.LEARNING_TRACK && (
            <InputCheckbox
              name="myCourse"
              label={t('searchResultPage.myCourse')}
              checked={myCourse === '1'}
              onChange={(e) => {
                handleChange('myCourse', e.target.checked ? '1' : undefined);
              }}
            />
          )}
          {type === searchTypes.LEARNING_TRACK && (
            <InputCheckbox
              name="myLearningTrack"
              label={t('searchResultPage.myLearningTrack')}
              checked={myLearningTrack === '1'}
              onChange={(e) => {
                handleChange(
                  'myLearningTrack',
                  e.target.checked ? '1' : undefined,
                );
              }}
            />
          )}
        </div>
        <div
          className={cx(
            'ml-2 flex-shrink-0 cursor-pointer border-l border-gray-400 pl-2 text-caption font-semibold text-brand-primary lg:ml-3',
          )}
          onClick={handleClear}
        >
          {t('searchResultPage.clear')}
        </div>
      </div>
    </div>
  );
}
