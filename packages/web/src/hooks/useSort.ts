import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';

function useSort() {
  const router = useRouter();

  const order = ((router.query.order as string) || '').trim();
  const orderBy = ((router.query.orderBy as string) || '').trim();

  const setSortQuery = ({
    order,
    orderBy,
  }: {
    order: 'ASC' | 'DESC';
    orderBy: string;
  }) => {
    router.replace(
      stringifyUrl({
        url: router.pathname,
        query: {
          ...router.query,
          order,
          orderBy,
        },
      }),
      undefined,
      { scroll: false },
    );
  };

  return {
    order,
    orderBy,
    setSortQuery,
  };
}

export default useSort;
