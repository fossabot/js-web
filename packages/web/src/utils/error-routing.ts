import { NextPageContext } from 'next';
import { SingletonRouter } from 'next/router';
import * as Sentry from '@sentry/react';

export const errorRouting = (ctx: NextPageContext, router: SingletonRouter) => {
  if (ctx.res) {
    ctx.res.writeHead(301, { Location: '/404' });
    ctx.res.end();
  } else {
    router.push('/404');
  }
};

export const captureError = (error: any) => {
  Sentry.captureException(error);
};
