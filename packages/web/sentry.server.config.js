// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT_NAME =
  process.env.SENTRY_ENVIRONMENT_NAME ||
  process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT_NAME;

Sentry.init({
  environment: SENTRY_ENVIRONMENT_NAME || 'local',
  dsn: SENTRY_DSN,
  tracesSampleRate:
    SENTRY_ENVIRONMENT_NAME === 'production' ||
    SENTRY_ENVIRONMENT_NAME === 'staging'
      ? 0.5
      : 1.0,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
