import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface IUsePaginationProps {
  defaultPerPage?: number;
  defaultPage?: number;
}

function usePagination(options?: IUsePaginationProps) {
  const router = useRouter();
  const defaultPage = options?.defaultPage || 1;
  const defaultPerPage = options?.defaultPerPage || 10;

  const [page, setPage] = useState<number>(defaultPage);
  const [perPage, setPerPage] = useState<number>(defaultPerPage);

  useEffect(() => {
    const pageString = (router.query.page as string) || defaultPage.toString();
    const limitString =
      (router.query.perPage as string) || defaultPerPage.toString();

    setPage(parseInt(pageString));
    setPerPage(parseInt(limitString));
  }, [
    router.query.page,
    router.query.perPage,
    options?.defaultPerPage,
    options?.defaultPage,
  ]);

  return {
    pathname: router.pathname,
    page,
    perPage,
    setPage: (page: number) =>
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, page, perPage },
        },
        undefined,
        { shallow: true },
      ),
    setPerPage: (perPage: number) =>
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, page, perPage },
        },
        undefined,
        { shallow: true },
      ),
  };
}

export default usePagination;
