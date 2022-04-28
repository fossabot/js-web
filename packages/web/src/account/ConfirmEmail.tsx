import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import API_PATHS from '../constants/apiPaths';
import WEB_PATHS from '../constants/webPaths';
import { authHttp } from '../http';
import useTranslation from '../i18n/useTranslation';
import CenterLayout from '../layouts/center.layout';
import Button from '../ui-kit/Button';
import MinimalNavbar from '../ui-kit/headers/MinimalNavbar';
import { captureError } from '../utils/error-routing';

export default function ConfirmEmail() {
  const router = useRouter();
  const key = ((router.query.key as string) || '').trim();
  const { t } = useTranslation();
  const [hasChecked, setHasChecked] = useState(false);
  const [success, setSuccess] = useState(false);

  async function verifyKey() {
    try {
      await authHttp.post(API_PATHS.CONFIRM_EMAIL, {
        key: key.trim(),
      });

      setSuccess(true);
    } catch (e) {
      console.error(e);
      captureError(e);
    } finally {
      setHasChecked(true);
    }
  }

  function goToDashboard() {
    router.replace(WEB_PATHS.DASHBOARD);
  }

  useEffect(() => {
    if (router.isReady) {
      verifyKey();
    }
  }, [router.isReady]);

  const head = (
    <Head>
      <title>{t('emailConfirmation.pageTitle')}</title>
    </Head>
  );

  return (
    <CenterLayout head={head} header={<MinimalNavbar />}>
      {!hasChecked ? (
        <div className="text-subtitle">{t('emailConfirmation.inProgress')}</div>
      ) : (
        <div>
          {success ? (
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 text-subtitle">
                {t('emailConfirmation.successTitle')}
              </div>
              <div className="text-body">{t('emailConfirmation.success')}</div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 text-subtitle">
                {t('emailConfirmation.failedTitle')}
              </div>
              <div className="text-body">{t('emailConfirmation.failed')}</div>
            </div>
          )}
          <div className="mx-auto mt-8 flex w-60 items-center justify-center">
            <Button variant="primary" size="medium" onClick={goToDashboard}>
              {t('emailConfirmation.goToDashboard')}
            </Button>
          </div>
        </div>
      )}
    </CenterLayout>
  );
}
