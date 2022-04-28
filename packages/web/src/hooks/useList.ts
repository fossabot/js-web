import { useState, useEffect } from 'react';

import usePagination from './usePagination';
import { AxiosResponse } from 'axios';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import useSearch from './useSearch';
import useSort from './useSort';
import { useRouter } from 'next/router';
import { captureError } from '../utils/error-routing';

export interface FetchOptions {
  page: number;
  perPage: number;
  search: string;
  searchField: string;
  orderBy: string;
  order: string;
}

export interface ListResponse<T> {
  count: number;
  data: T[];
  totalPages: number;
  fetchData: () => Promise<void>;
}

function useList<T>(
  fetchList: (
    options: FetchOptions,
  ) => Promise<AxiosResponse<BaseResponseDto<T[]>>>,
  deps: any[] = [],
): ListResponse<T> {
  const router = useRouter();
  const { page, perPage, setPage } = usePagination();
  const { search, searchField } = useSearch();
  const { order, orderBy } = useSort();

  const [count, setCount] = useState(0);
  const [data, setData] = useState<T[]>([]);
  const [totalPages, setTotalPage] = useState(0);

  async function fetchData() {
    try {
      const { data } = await fetchList({
        page,
        perPage,
        search,
        searchField,
        order,
        orderBy,
        ...router.query,
      });

      setData(data.data);
      setCount(data.pagination.total);
      setTotalPage(data.pagination.totalPages);

      if (page > data.pagination.totalPages && data.pagination.totalPages > 0)
        await setPage(data.pagination.totalPages);
    } catch (err) {
      captureError(err);
    }
  }

  useEffect(() => {
    fetchData();
  }, [
    page,
    perPage,
    search,
    searchField,
    orderBy,
    order,
    router.query,
    ...deps,
  ]);

  return {
    count,
    data,
    totalPages,
    fetchData,
  };
}

export default useList;
