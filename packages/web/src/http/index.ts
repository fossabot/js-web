import Router from 'next/router';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import config from '../config';
import WEB_PATHS from '../constants/webPaths';
import { AUTH_ROUTES } from '../constants/routes';
import { logout, setInMemoryToken } from '../app-state/auth';
import NEXT_API_PATHS from '../constants/nextApiPaths';
import { getSelectedLang, redirectToPathWithLocale } from '../i18n/lang-utils';
import { HTTP_AUTH_HEADER, HTTP_MESSAGE, HTTP_STATUS } from '../constants/http';
import { ERROR_CODES } from '../constants/errors';
import { stringifyUrl } from 'query-string';
import { isValidUUID } from '../utils/uuid';
import API_PATHS from '../constants/apiPaths';
import { addMonths, endOfDay, startOfDay } from 'date-fns';

export const axiosInstance = (baseURL: string): AxiosInstance => {
  return axios.create({
    baseURL,
    timeout: 5000,
  });
};

const authInstance = axiosInstance(config.AUTH_API_BASE_URL);
const centralInstance = axiosInstance(config.CENTRAL_API_BASE_URL);
const paymentInstance = axiosInstance(config.PAYMENT_API_BASE_URL);
const notificationInstance = axiosInstance(config.NOTIFICATION_BASE_URL);

authInstance.interceptors.request.use((req) => requestInterceptor(req));
centralInstance.interceptors.request.use((req) => requestInterceptor(req));
paymentInstance.interceptors.request.use((req) => requestInterceptor(req));
notificationInstance.interceptors.request.use((req) => requestInterceptor(req));
authInstance.interceptors.response.use(
  (res) => res,
  (error: any) => responseInterceptor(error, authInstance),
);
centralInstance.interceptors.response.use(
  (res) => res,
  (error: any) => responseInterceptor(error, centralInstance),
);
paymentInstance.interceptors.response.use(
  (res) => res,
  (error: any) => responseInterceptor(error, paymentInstance),
);
notificationInstance.interceptors.response.use(
  (res) => res,
  (error: any) => responseInterceptor(error, notificationInstance),
);

export function setAuthHeader(token) {
  authInstance.defaults.headers[HTTP_AUTH_HEADER] = token;
  centralInstance.defaults.headers[HTTP_AUTH_HEADER] = token;
  paymentInstance.defaults.headers[HTTP_AUTH_HEADER] = token;
  notificationInstance.defaults.headers[HTTP_AUTH_HEADER] = token;
}

export const nextAuthInstance = axios.create({ timeout: 5000 });
nextAuthInstance.interceptors.response.use(
  (res) => res,
  (error: any) => responseInterceptor(error, nextAuthInstance),
);

export async function getRefreshToken() {
  try {
    const url = NEXT_API_PATHS.REFRESH_TOKEN;
    const response = await nextAuthInstance.get(url, {
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

const isPotentiallySlowEndpoints = (url: string) => {
  if (url.startsWith('/v1/admin')) return true;
  if (url.startsWith(API_PATHS.COURSE_SESSIONS_MANAGEMENT_EXPORT_REPORT))
    return true;

  const isGetCourseDetail = (u: string): boolean =>
    u.startsWith('v1/course/') && isValidUUID(u.substring(10, url.length));

  if (isGetCourseDetail(url)) return true;

  const isCourseEnroll = (u: string): boolean =>
    u.startsWith('v1/course/') &&
    isValidUUID(
      u.substring('v1/course/'.length, url.length - '/enroll'.length),
    );

  if (isCourseEnroll(url)) return true;

  return false;
};

export async function requestInterceptor(req: AxiosRequestConfig) {
  const acceptLanguage = getSelectedLang();
  if (acceptLanguage) {
    req.headers['Accept-Language'] = acceptLanguage;
  }

  const now = new Date();

  req.headers['Now'] = now.toISOString();
  req.headers['Start-Of-Day'] = startOfDay(now).toISOString();
  req.headers['End-Of-Day'] = endOfDay(now).toISOString();
  req.headers['End-Of-Range'] = addMonths(endOfDay(now), 3).toISOString();

  req.timeout = isPotentiallySlowEndpoints(req.url) ? 10000 : 5000;

  return req;
}

export async function responseInterceptor(error: any, instance: AxiosInstance) {
  if (!error.response) {
    throw error;
  }

  const originalRequest = error.config;
  let errorResponseData = error?.response?.data;

  // errors from serverside http requests still use this interceptor,
  // and error out as Blob is only defined from `window`
  if (typeof window !== 'undefined' && errorResponseData instanceof Blob) {
    const text = await blobToText(errorResponseData);
    errorResponseData = JSON.parse(text);
  }

  if (errorResponseData) {
    const { code, statusCode, message } = errorResponseData;

    if (
      (statusCode === HTTP_STATUS.UNAUTHORIZED &&
        message === HTTP_MESSAGE.SESSION_EXPIRED) ||
      originalRequest.retryCount > 5
    ) {
      setInMemoryToken(null);
      if (AUTH_ROUTES.includes(Router.pathname)) return;
      redirectToPathWithLocale(Router.locale, WEB_PATHS.LOGIN);

      return;
    }

    if (
      statusCode === HTTP_STATUS.UNAUTHORIZED &&
      message === HTTP_MESSAGE.UNAUTHORIZED &&
      !originalRequest.__isRetryRequest
    ) {
      originalRequest._retry = true;
      originalRequest.retryCount = isNaN(originalRequest.retryCount)
        ? 1
        : originalRequest.retryCount++;

      const res = await getRefreshToken();

      setInMemoryToken({
        jwtToken: res.accessToken,
        jwtTokenExpiry: res.accessTokenExpiry,
        user: res.user,
      });
      originalRequest.headers['auth_token'] = res.accessToken;

      return instance.request(originalRequest);
    }

    if (
      code === ERROR_CODES.ERROR_USER_DEACTIVATED.code &&
      !AUTH_ROUTES.includes(Router.pathname)
    ) {
      if (typeof window !== 'undefined') {
        await logout({
          errorCode: 'ERROR_USER_DEACTIVATED',
        });

        // Fallback to refresh entire window using VanillaJS
        // Because sometime Next.js will be blocked after getting many errors.
        const url = stringifyUrl({
          url: WEB_PATHS.LOGIN,
          query: {
            error: 'ERROR_USER_DEACTIVATED',
          },
        });
        window.location.href = url;
      }
    }
  }

  throw error;
}

async function blobToText(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function () {
      resolve(reader.result.toString());
    };
    reader.onerror = reject;
    reader.readAsText(blob);
  });
}

export {
  authInstance as authHttp,
  centralInstance as centralHttp,
  paymentInstance as paymentHttp,
  notificationInstance as notificationHttp,
};
