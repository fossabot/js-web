import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';
import { useCallback, useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import API_PATHS from '../../constants/apiPaths';
import WEB_PATHS from '../../constants/webPaths';
import { notificationHttp } from '../../http';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import { IEmailLog } from '../../models/emailLogs';
import IPaginationParams from '../../models/IPaginationParams';
import { captureError } from '../../utils/error-routing';

export interface IEmailLogsListFilters {
  search: string | undefined;
  page: number;
  order:
    | 'email'
    | 'subject'
    | 'category'
    | 'sentDate'
    | 'numbers'
    | 'organizationName'
    | undefined;
  range: 'week' | 'month' | 'all' | undefined;
  orderBy: 'ASC' | 'DESC' | undefined;
  perPage: number;
}

export const initialListFilters: IEmailLogsListFilters = {
  search: undefined,
  page: 1,
  order: undefined,
  orderBy: undefined,
  perPage: 20,
  range: undefined,
};

export const transformFiltersToQuery = (filters: IEmailLogsListFilters) => {
  const { search, ..._filters } = filters;
  const params: any = { ..._filters };

  if (search?.trim().length > 0) {
    params.search = search.trim();
  }
  return params;
};

export const useEmailLogs = () => {
  const router = useRouter();

  const [emailLogs, setEmailLogs] =
    useState<IEmailLog[] | undefined>(undefined);
  const [emailRangeCounts, setEmailRangeCounts] = useState([0, 0, 0, 0]);
  const [pagination, setPagination] =
    useState<IPaginationParams | undefined>(undefined);

  const [emailLogsFilter, setEmailLogsFilter] = useState<IEmailLogsListFilters>(
    cloneDeep(initialListFilters),
  );

  const fetchEmailLogs = useCallback(async (filters: IEmailLogsListFilters) => {
    try {
      const res = await notificationHttp.get<BaseResponseDto<IEmailLog[]>>(
        API_PATHS.USER_EMAIL_NOTIFICATIONS,
        {
          params: transformFiltersToQuery(filters),
        },
      );
      unstable_batchedUpdates(() => {
        setEmailLogs(res.data.data);
        setPagination(res.data.pagination);
      });
    } catch (err) {
      captureError(err);
    }
  }, []);

  const fetchEmailRangeCount = useCallback(
    async (filters: IEmailLogsListFilters) => {
      try {
        const res = await notificationHttp.get<BaseResponseDto<number[]>>(
          API_PATHS.USER_EMAIL_NOTIFICATIONS_COUNTS,
          {
            params: transformFiltersToQuery(filters),
          },
        );
        unstable_batchedUpdates(() => {
          setEmailRangeCounts(res.data.data);
        });
      } catch (err) {
        console.error(err);
      }
    },
    [],
  );

  useEffect(() => {
    const { search, order, orderBy, page, perPage, range } = router.query;
    const valuesFromQuery = cloneDeep(initialListFilters);

    valuesFromQuery.search = String(search || '');

    if (order) {
      valuesFromQuery.order = order as IEmailLogsListFilters['order'];
      valuesFromQuery.orderBy =
        (String(orderBy) as IEmailLogsListFilters['orderBy']) || 'ASC';
    }

    if (page) {
      try {
        const _page = Number(page);
        if (_page > 0) {
          valuesFromQuery.page = _page;
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (perPage) {
      try {
        const _perPage = Number(perPage);
        if (_perPage > 0) {
          valuesFromQuery.perPage = _perPage;
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (range && ['week', 'month', 'all'].includes(String(range))) {
      valuesFromQuery.range = range as IEmailLogsListFilters['range'];
    }

    setEmailLogsFilter((emailLogsFilter) => {
      if (!isEqual(emailLogsFilter, valuesFromQuery)) {
        fetchEmailLogs(valuesFromQuery);

        if (
          emailLogsFilter.search === undefined ||
          emailLogsFilter.search !== valuesFromQuery.search
        ) {
          fetchEmailRangeCount(valuesFromQuery);
        }
      }

      return valuesFromQuery;
    });
  }, [fetchEmailLogs, fetchEmailRangeCount, router.query]);

  const emailLogsFilterRef = useRef(emailLogsFilter);

  useEffect(() => {
    emailLogsFilterRef.current = emailLogsFilter;
  }, [emailLogsFilter]);

  const onChangeFilter = useCallback(
    (
      getQuery: (
        query: IEmailLogsListFilters,
      ) => Partial<IEmailLogsListFilters>,
    ) => {
      const query = getQuery(emailLogsFilterRef.current);

      if (query.page === 1) query.page = undefined;

      if (query.search?.trim().length === 0) query.search = undefined;

      router.push(
        stringifyUrl({
          url: WEB_PATHS.EMAIL_LOGS,
          query: JSON.parse(JSON.stringify(query)),
        }),
        undefined,
        {
          shallow: true,
        },
      );
    },
    [router],
  );

  const onRefresh = useCallback(() => {
    fetchEmailLogs(emailLogsFilterRef.current);
    fetchEmailRangeCount(emailLogsFilterRef.current);
  }, [fetchEmailLogs, fetchEmailRangeCount]);

  return {
    onChangeFilter,
    emailLogsFilter,
    emailLogs,
    emailRangeCounts,
    pagination,
    onRefresh,
  };
};
