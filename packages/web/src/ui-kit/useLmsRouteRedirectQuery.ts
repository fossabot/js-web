import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import queryString from 'query-string';
import { ParsedUrlQuery } from 'querystring';

export interface LmsRouteRedirectQuery {
  data?: any;
  code?: string;
  message?: string;
}

export function useLmsRouteRedirectQuery() {
  const router = useRouter();
  const [query, setQuery] = useState<LmsRouteRedirectQuery>({});
  const ERROR_CODE = {
    ERROR_OAUTH: 'ERROR_OAUTH',
    ERROR_SAML_LOGIN: 'ERROR_SAML_LOGIN',
    ERROR_SAML_SSO: 'ERROR_SAML_SSO',
  };

  useEffect(() => {
    setQuery(transformQuery(router.query));
    removeQueryFromUrl(router.query);
  }, []);

  function transformQuery(routerQuery: ParsedUrlQuery) {
    try {
      const outQuery = { ...routerQuery };
      outQuery.data = JSON.parse(outQuery.data as string);
      return outQuery;
    } catch (error) {
      return routerQuery;
    }
  }

  function removeQueryFromUrl(routerQuery: ParsedUrlQuery) {
    const outQuery = { ...routerQuery };
    delete outQuery.data;
    delete outQuery.code;
    delete outQuery.message;

    const url = queryString.stringifyUrl({
      url: router.pathname,
      query: outQuery,
    });

    router.replace(url, null, { shallow: true });
    return url;
  }

  return {
    ERROR_CODE,
    query,
  };
}
