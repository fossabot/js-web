// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');
const { withServiceWorker } = require('next-sw');

const sentryWebpackPluginOptions = {
  // For build NextJS on local machine
  dryRun:
    process.env.NODE_ENV !== 'production' ||
    process.env.APP_ENV === 'development',
  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

module.exports = withSentryConfig(
  withServiceWorker({
    serviceWorker: {
      name: 'sw.js',
      entry: 'src/service-workers/index.ts',
      livereload: true,
    },
    i18n: {
      localeDetection: false,
      locales: ['en', 'th'],
      defaultLocale: 'en',
    },
    images: {
      domains: ['localhost'],
    },
    env: {
      AUTH_API_BASE_URL: process.env.AUTH_API_BASE_URL,
    },
    async rewrites() {
      return [
        {
          source: '/scorm_files/:path*',
          has: [{ type: 'cookie', key: 'scorm_token' }],
          destination: `${process.env.CENTRAL_API_BASE_URL}/v1/scorm/file?key=scorm/:path*`,
        },
        {
          source: '/scorm_files_bypass/:path*',
          destination: `${process.env.CENTRAL_API_BASE_URL}/v1/scorm/file?key=scorm/:path*`,
        },
        {
          source: '/scorm_files/:path*',
          destination: `/api/scorm-token?location=/scorm_files`,
        },
        {
          source: '/:path*',
          destination: '/:path*',
        },
      ];
    },
  }),
  sentryWebpackPluginOptions,
);
