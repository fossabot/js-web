import { AppProps } from 'next/app';
import '../styles/global.css';
import 'focus-visible';

import I18nProvider from '../src/i18n/Provider';
import { setDefaultLangCookie } from '../src/i18n/lang-utils';
import { ToastProvider } from 'react-toast-notifications';
import SnackBar from '../src/ui-kit/SnackBar';
import ToastContainer from '../src/ui-kit/ToastContainer';
import { ErrorBoundary } from '@sentry/nextjs';
import { SystemError } from '../src/ui-kit/SystemError';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  setDefaultLangCookie();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        });
      }
    };
  }, []);

  return (
    <ErrorBoundary fallback={SystemError}>
      <I18nProvider>
        <ToastProvider
          autoDismiss={true}
          autoDismissTimeout={3000}
          placement="top-center"
          newestOnTop
          components={{ ToastContainer, Toast: SnackBar }}
        >
          <Component {...pageProps} />
        </ToastProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
