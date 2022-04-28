import cx from 'classnames';
import { find } from 'lodash';
import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';
import { useMemo } from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../../tailwind.config';
import useTranslation from '../../i18n/useTranslation';
import { UserEnrolledCourseStatuses } from '../../models/course';
import InputSelect, { IInputSelect } from '../../ui-kit/InputSelect';

interface ICourseListFilters {
  stats: UserEnrolledCourseStatuses;
  currentStatus: keyof UserEnrolledCourseStatuses;
  onStatusChanged: (status: keyof UserEnrolledCourseStatuses) => void;
}

const { theme } = resolveConfig(tailwindConfig);

function CourseListFilters({
  stats,
  currentStatus,
  onStatusChanged,
}: ICourseListFilters) {
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
    value: keyof UserEnrolledCourseStatuses;
  }[] = useMemo(
    () => [
      {
        label:
          t('dashboardCourseListPage.statuses.notStarted') +
          ' ' +
          stats['notStarted'],
        value: 'notStarted',
      },
      {
        label:
          t('dashboardCourseListPage.statuses.inProgress') +
          ' ' +
          stats['inProgress'],
        value: 'inProgress',
      },
      {
        label:
          t('dashboardCourseListPage.statuses.completed') +
          ' ' +
          stats['completed'],
        value: 'completed',
      },
      {
        label:
          t('dashboardCourseListPage.statuses.archived') +
          ' ' +
          stats['archived'],
        value: 'archived',
      },
    ],
    [stats],
  );

  const sortOptions = useMemo(
    () => [
      {
        label: t('dashboardCourseListPage.sortOptions.mostRecent'),
        value: 'createdAt',
      },
      {
        label: t('dashboardCourseListPage.sortOptions.alphabetical'),
        value: 'title',
      },
      {
        label: t('dashboardCourseListPage.sortOptions.assigned'),
        value: 'assignedCourse',
      },
      {
        label: t('dashboardCourseListPage.sortOptions.required'),
        value: 'requiredCourse',
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
    <div className="flex items-center justify-between border-b border-gray-200 bg-white lg:mx-6 lg:mt-6 lg:w-181 lg:border-b-0">
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

export default CourseListFilters;
