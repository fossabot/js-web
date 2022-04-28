import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';

function useSearch() {
  const router = useRouter();

  const search = ((router.query.search as string) || '').trim();
  const searchField = ((router.query.searchField as string) || '').trim();

  const setSearchQuery = ({
    search,
    searchField,
  }: {
    search: string;
    searchField: string;
  }) => {
    router.push(
      stringifyUrl({
        url: router.pathname,
        query: {
          ...router.query,
          search,
          searchField,
        },
      }),
    );
  };

  return {
    search,
    searchField,
    setSearchQuery,
  };
}

export default useSearch;
