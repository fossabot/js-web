import cx from 'classnames';
import { useMemo } from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../../tailwind.config';
import useTranslation from '../../i18n/useTranslation';
import { UserEnrolledLearningTrackStatus } from '../../models/learningTrack';
import InputSelect, { IInputSelect } from '../../ui-kit/InputSelect';
import { find } from 'lodash';
import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';

interface ILearningTrackListFilters {
  stats: Record<UserEnrolledLearningTrackStatus, number>;
  currentStatus: UserEnrolledLearningTrackStatus;
  onStatusChanged: (status: UserEnrolledLearningTrackStatus) => void;
}

const { theme } = resolveConfig(tailwindConfig);

function LearningTrackListFilters({
  stats,
  currentStatus,
  onStatusChanged,
}: ILearningTrackListFilters) {
  const { t } = useTranslation();
  const router = useRouter();
  const orderBy = (router.query.orderBy as string) || 'createdAt';

  const overrideStyles: IInputSelect['overrideStyles'] = {
    control: () => ({
      padding: `0px ${theme.padding['4']}`,
      border: 0,
      height: 'calc(100% - 1px)',
    }),
    valueContainer: () => ({
      padding: 0,
    }),
    option: (base, state) => ({
      paddingRight: state.isSelected ? '2.5rem' : '0',
      '::after': {
        top: '1.75rem',
      },
    }),
  };

  const statusOptions: {
    label: string;
    value: UserEnrolledLearningTrackStatus;
  }[] = useMemo(
    () => [
      {
        label:
          t('dashboardLearningTrackListPage.statuses.notStarted') +
          ' ' +
          stats['notStarted'],
        value: UserEnrolledLearningTrackStatus.ENROLLED,
      },
      {
        label:
          t('dashboardLearningTrackListPage.statuses.inProgress') +
          ' ' +
          stats['inProgress'],
        value: UserEnrolledLearningTrackStatus.IN_PROGRESS,
      },
      {
        label:
          t('dashboardLearningTrackListPage.statuses.completed') +
          ' ' +
          stats['completed'],
        value: UserEnrolledLearningTrackStatus.COMPLETED,
      },
      {
        label:
          t('dashboardLearningTrackListPage.statuses.archived') +
          ' ' +
          stats['archived'],
        value: UserEnrolledLearningTrackStatus.ARCHIVED,
      },
    ],
    [stats],
  );

  const sortOptions = useMemo(
    () => [
      {
        label: t('dashboardLearningTrackListPage.sortOptions.mostRecent'),
        value: 'createdAt',
      },
      {
        label: t('dashboardLearningTrackListPage.sortOptions.alphabetical'),
        value: 'title',
      },
      {
        label: t('dashboardLearningTrackListPage.sortOptions.assigned'),
        value: 'assignedLearningTrack',
      },
    ],
    [],
  );

  function onOrderByOptionChanged({ target: { value } }) {
    const url = stringifyUrl({
      url: router.pathname,
      query: {
        ...router.query,
        orderBy: value,
      },
    });
    router.push(url);
  }

  function onStatusOptionChanged({ target: { value } }) {
    const url = stringifyUrl({
      url: router.pathname,
      query: {
        ...router.query,
        status: value,
      },
    });
    router.push(url);
  }

  return (
    <div className="flex items-center justify-between border-b border-gray-200 lg:mx-6 lg:mt-6 lg:w-181 lg:border-b-0">
      <div className="hidden items-center overflow-hidden rounded-lg border border-gray-300 lg:flex">
        {statusOptions.map((option, index) => (
          <div
            key={index}
            onClick={() => onStatusChanged(option.value)}
            className={cx(
              'flex cursor-pointer flex-nowrap items-center space-x-1 whitespace-nowrap border-gray-300 px-4 py-3.5 text-caption font-semibold',
              {
                'bg-brand-primary text-white': option.value === currentStatus,
                'texrt-black bg-white': option.value !== currentStatus,
                'border-l': index !== 0,
              },
            )}
          >
            <div>{option.label}</div>
          </div>
        ))}
      </div>
      <div className="flex w-1/2 justify-end border-r border-gray-200 py-3 lg:hidden lg:border-r-0 lg:py-0">
        <InputSelect
          name="orderBy"
          options={statusOptions}
          value={
            find(statusOptions, (option) => option.value === currentStatus) ||
            statusOptions[0]
          }
          renderOptions={statusOptions}
          onBlur={onStatusOptionChanged}
          onChange={onStatusOptionChanged}
          overrideStyles={overrideStyles}
        />
      </div>
      <div className="flex w-1/2 justify-end py-3 lg:w-56 lg:py-0">
        <InputSelect
          name="orderBy"
          options={sortOptions}
          value={
            find(sortOptions, (option) => option.value === orderBy) ||
            sortOptions[0]
          }
          renderOptions={sortOptions}
          onBlur={onOrderByOptionChanged}
          onChange={onOrderByOptionChanged}
          overrideStyles={overrideStyles}
          selectClassWrapperName="lg:hidden"
        />
        <InputSelect
          name="orderBy"
          options={sortOptions}
          value={
            find(sortOptions, (option) => option.value === orderBy) ||
            sortOptions[0]
          }
          renderOptions={sortOptions}
          onBlur={onOrderByOptionChanged}
          onChange={onOrderByOptionChanged}
          selectClassWrapperName="hidden lg:block"
        />
      </div>
    </div>
  );
}

export default LearningTrackListFilters;
