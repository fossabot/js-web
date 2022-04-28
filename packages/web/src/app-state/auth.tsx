import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { NextPageContext } from 'next';
import parseCookies from 'next-cookies';
import Router, { useRouter } from 'next/router';

import { ITokenObject } from '../models/auth';
import WEB_PATHS from '../constants/webPaths';
import API_PATHS from '../constants/apiPaths';
import NEXT_API_PATHS from '../constants/nextApiPaths';
import { nextAuthInstance, setAuthHeader, centralHttp } from '../http';
import { cookie as cookieHandler } from '../utils/cookies';
import { AUTH_ROUTES, SAML_LOGIN_ROUTE } from '../constants/routes';
import { getPrependLocale, redirectToPathWithLocale } from '../i18n/lang-utils';
import { AuthContext } from './authContext';
import querystring, { stringifyUrl } from 'query-string';
import { captureError } from '../utils/error-routing';
import { NotificationContext } from './notificationContext';
import { useNotification } from '../hooks/useNotification';
import { SystemAnnouncementContextProvider } from './systemAnnouncementContext';

type IContext = NextPageContext;

let inMemoryToken: ITokenObject = null;
let inMemoryPolicies: string[] = [];

export function login(
  { jwtToken, jwtTokenExpiry, user }: ITokenObject,
  noRedirect?: boolean,
  redirectRoute = WEB_PATHS.DASHBOARD,
) {
  if (typeof window !== 'undefined') {
    setInMemoryToken({
      jwtToken,
      jwtTokenExpiry,
      user,
    });

    if (!noRedirect) {
      Router.replace(redirectRoute);
    }
  }
}

interface ILogoutOptions {
  errorCode?: string;
}

export async function logout(options?: ILogoutOptions) {
  try {
    const url = NEXT_API_PATHS.LOGOUT;
    await nextAuthInstance.post(
      url,
      {},
      {
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-cache',
          auth_token: inMemoryToken ? inMemoryToken.jwtToken : '',
        },
      },
    );
    setInMemoryToken(null);
    // TODO: find a better way to log out accross multiple browser tabs/windows
    window.localStorage.setItem('logout', Date.now().toString());
    // trigger getInitialProps on the server side
    const loginUrl = stringifyUrl({
      url: WEB_PATHS.LOGIN,
      query: {
        error: options?.errorCode,
      },
    });
    redirectToPathWithLocale(Router.locale, loginUrl);
    return;
  } catch (error) {
    console.error({ error });
  }
}

export function isExternalAuthFlow(flow: string) {
  return flow === 'oauth2' || flow === 'samlSSO';
}

export function isLoginToExternalSystemFlow(flow: string) {
  return flow === 'saml-sp-login';
}

function setSamlSPLoginUriToCookie(ctx: IContext, uri?: string) {
  const clearProps = !uri ? { expires: new Date(0) } : {};

  cookieHandler(ctx.res, 'saml_sp_login_url', !uri ? '' : uri, {
    ...clearProps,
    httpOnly: true,
    path: '/',
    secure: process.env.SSL_ENABLED === 'true',
  });
}

export function handleSamlSPSSORedirection(
  jwtToken: string,
  targetUri: string,
  ctx?: IContext,
) {
  if (!jwtToken) return;

  const baseUrl = process.env.AUTH_API_BASE_URL;
  const redirectLocation = `${baseUrl}${targetUri}&auth_token=${jwtToken}`;

  if (ctx && targetUri) {
    setSamlSPLoginUriToCookie(ctx, '');

    ctx.res.writeHead(302, {
      Location: redirectLocation,
    });
    ctx.res.end();
    return;
  } else if (
    !ctx &&
    typeof window !== 'undefined' &&
    [SAML_LOGIN_ROUTE].includes(window.location.pathname)
  ) {
    window.location.replace(redirectLocation);
    return;
  }
}

async function getRefreshTokenClient() {
  try {
    const response = await axios.get(NEXT_API_PATHS.REFRESH_TOKEN, {
      withCredentials: true,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    const { accessToken, accessTokenExpiry, user } = response.data;
    return { accessToken, accessTokenExpiry, user };
  } catch (error) {
    throw error;
  }
}

async function getRefreshTokenServer(ctx?: IContext) {
  try {
    const url = process.env.AUTH_API_BASE_URL;
    const { refresh_token = '' } = parseCookies(ctx);
    const response = await axios.get(`${url}${API_PATHS.REFRESH_TOKEN}`, {
      headers: {
        refresh_token,
        'Cache-Control': 'no-cache',
      },
    });
    const { accessToken, accessTokenExpiry, user } = response.data;
    return { accessToken, accessTokenExpiry, user };
  } catch (error) {
    throw error;
  }
}

export async function getRefreshToken(ctx?: IContext) {
  if (ctx && ctx.req) {
    return getRefreshTokenServer(ctx);
  }
  return getRefreshTokenClient();
}

export async function getAuthToken(ctx?: IContext) {
  try {
    const {
      accessToken: jwtToken,
      accessTokenExpiry: jwtTokenExpiry,
      user,
    } = await getRefreshToken(ctx);
    login({ jwtToken, jwtTokenExpiry, user }, true);
    return { jwtToken, jwtTokenExpiry, user };
  } catch (error) {
    return;
  }
}

function handleRedirectOnError(ctx?: IContext & { req: { cookies: any } }) {
  if (ctx && ctx.req) {
    if (AUTH_ROUTES.includes(ctx.pathname)) return;
    const locale = ctx.req.cookies.NEXT_LOCALE;
    const url = `${getPrependLocale(locale)}${WEB_PATHS.LOGIN}`;
    ctx.res.writeHead(302, {
      Location: querystring.stringifyUrl({
        url,
        query: { referer: ctx.asPath },
      }),
    });
    ctx.res.end();
  }
}

async function handleExternalAuthFlow(
  ctx?: IContext & { req: { cookies: any } },
) {
  try {
    const { token } = ctx.query;
    const url = process.env.AUTH_API_BASE_URL;
    const response = await axios.post(
      `${url}${API_PATHS.LOGIN_EXTERNAL}`,
      {},
      {
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-cache',
          auth_token: token,
        },
      },
    );

    const { refreshToken, refreshTokenExpiry } = response.data;
    cookieHandler(ctx.res, 'refresh_token', refreshToken, {
      maxAge: refreshTokenExpiry * 1000,
      httpOnly: true,
      path: '/',
      secure: process.env.SSL_ENABLED === 'true',
    });

    const query = ctx?.req?.cookies.saml_sp_login_url
      ? '?flow=saml-sp-login'
      : '';

    ctx.res.writeHead(302, { Location: `${ctx.pathname}${query}` });
    ctx.res.end();
  } catch (error) {
    if (error.response?.data?.code) {
      const locale = ctx.req.cookies.NEXT_LOCALE;
      ctx.res.writeHead(302, {
        Location: `${getPrependLocale(locale)}${WEB_PATHS.LOGIN}?code=${
          error.response?.data?.code
        }`,
      });
      ctx.res.end();
    }
    handleRedirectOnError(ctx);
  }
}

async function extractExternalAuthHeader(ctx?: IContext) {
  const { refreshToken, flow } = ctx && ctx.query ? ctx.query : ({} as any);
  return {
    isExternalAuthFlow: isExternalAuthFlow(flow),
    refreshToken,
  };
}

function clearServerInMemoryToken(ctx?: IContext) {
  if (ctx && ctx.req) {
    setInMemoryToken(null);
  }
}

async function handleAuthRefresh(
  failureRedirect: boolean,
  ctx?: IContext & { req: { cookies: any } },
) {
  clearServerInMemoryToken(ctx);
  if (!inMemoryToken) {
    try {
      const res = await extractExternalAuthHeader(ctx);
      if (res.isExternalAuthFlow) {
        return handleExternalAuthFlow(ctx);
      }

      const {
        accessToken: jwtToken,
        accessTokenExpiry: jwtTokenExpiry,
        user,
      } = await getRefreshToken(ctx);
      await login({ jwtToken, jwtTokenExpiry, user }, true);

      return { jwtToken, jwtTokenExpiry, user };
    } catch (error) {
      if (failureRedirect) {
        handleRedirectOnError(ctx);
      }
      return;
    }
  }

  return inMemoryToken;
}

export function setInMemoryToken(token: ITokenObject) {
  inMemoryToken = token;
  if (token) {
    setAuthHeader(token.jwtToken);
  }

  if (token === null) {
    setInMemoryPolicies([]);
  }
}

export function getToken() {
  return inMemoryToken;
}

export function setInMemoryPolicies(policies: string[]) {
  inMemoryPolicies = policies;
}

function handleAuthRedirection(
  ctx?: IContext & { req: { cookies: any } },
  path?: string,
) {
  if (ctx && ctx.req && AUTH_ROUTES.includes(ctx.pathname)) {
    const locale = ctx.req.cookies.NEXT_LOCALE;
    ctx.res.writeHead(302, {
      Location: `${getPrependLocale(locale)}${[path]}`,
    });
    ctx.res.end();
  }
}

function handleSamlSPSSOLogin(
  jwtToken?: string,
  ctx?: IContext & { req: { cookies: any } },
) {
  try {
    if (
      ctx &&
      ctx.res &&
      ctx.query?.TARGET &&
      [SAML_LOGIN_ROUTE].includes(ctx.pathname)
    ) {
      setSamlSPLoginUriToCookie(ctx, ctx.query?.TARGET as string);
    } else if (ctx && ctx.res) {
      setSamlSPLoginUriToCookie(ctx, '');
    }
  } catch (error: any) {
    // Silence the auth error caused by setting header during redirection.
  }

  if (
    jwtToken &&
    ctx &&
    (ctx.query?.TARGET || ctx.req?.cookies?.saml_sp_login_url) &&
    ([SAML_LOGIN_ROUTE].includes(ctx.pathname) ||
      ([WEB_PATHS.DASHBOARD].includes(ctx.pathname) &&
        isLoginToExternalSystemFlow(ctx.query?.flow as string)))
  ) {
    handleSamlSPSSORedirection(
      jwtToken,
      (ctx.query?.TARGET as string) || ctx.req.cookies.saml_sp_login_url,
      ctx,
    );

    return true;
  }

  return false;
}

function withAuth(WrappedComponent, failureRedirect = true) {
  const Component = (props) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [redirecting, setRedirect] = useState(false);

    function syncLogout(event) {
      if (event.key === 'logout' && !AUTH_ROUTES.includes(router.pathname)) {
        redirectToPathWithLocale(Router.locale, WEB_PATHS.LOGIN);
      }
    }

    async function routeGuard() {
      if (!props.token && !AUTH_ROUTES.includes(router.pathname)) {
        setRedirect(true);
        await Router.replace(
          querystring.stringifyUrl({
            url: WEB_PATHS.LOGIN,
            query: { referer: router.asPath },
          }),
        );
      }
    }

    async function getMyPolicy() {
      try {
        setIsLoading(true);
        const { data } = await centralHttp.get(API_PATHS.GET_MY_POLICY);
        setInMemoryPolicies(data.data.policies);
      } catch (error) {
        captureError(error);
      } finally {
        setIsLoading(false);
      }
    }

    // this will run before the child component
    useMemo(() => {
      const { token } = props;
      if (failureRedirect) {
        routeGuard();
      }
      if (!inMemoryToken) {
        setInMemoryToken(token);
      }
      if (token) {
        if (inMemoryPolicies.length <= 0) {
          getMyPolicy();
        }
      }
    }, [props.token]);

    useEffect(() => {
      window.addEventListener('storage', syncLogout);
      return () => {
        window.removeEventListener('storage', syncLogout);
        window.localStorage.removeItem('logout');
      };
    }, []);

    const { notificationCount, setNotificationCount } = useNotification({
      token: props.token,
    });

    // to prevent wrapped component from rendering when
    // client-side redirection is going on
    if (redirecting) {
      return <div>{`Redirecting to ${WEB_PATHS.LOGIN}`}</div>;
    }

    return (
      <AuthContext.Provider
        value={{ token: props.token, policies: inMemoryPolicies, isLoading }}
      >
        <SystemAnnouncementContextProvider token={props.token}>
          <NotificationContext.Provider
            value={{ notificationCount, setNotificationCount }}
          >
            <WrappedComponent {...props} />
          </NotificationContext.Provider>
        </SystemAnnouncementContextProvider>
      </AuthContext.Provider>
    );
  };

  Component.getInitialProps = async (
    ctx: IContext & { req: { cookies: any } },
  ) => {
    const tokenObject = await handleAuthRefresh(failureRedirect, ctx);
    const samlSPSSOFlow = handleSamlSPSSOLogin(
      tokenObject && tokenObject.jwtToken,
      ctx,
    );

    if (!samlSPSSOFlow && tokenObject) {
      handleAuthRedirection(ctx, WEB_PATHS.DASHBOARD);
    }

    const componentProps = WrappedComponent.getInitialProps
      ? await WrappedComponent.getInitialProps(ctx, tokenObject)
      : {};

    return { ...componentProps, token: tokenObject };
  };

  return Component;
}

export default withAuth;
