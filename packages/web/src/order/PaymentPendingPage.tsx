import useTranslation from '../i18n/useTranslation';
import React, { useMemo } from 'react';

export default function PaymentPendingPage() {
  const { t } = useTranslation();

  const loader = useMemo(
    () => (
      <div className="mx-auto h-4 w-28 overflow-hidden">
        {React.createElement('lottie-player', {
          src: 'https://assets10.lottiefiles.com/packages/lf20_2bjaroii.json',
          background: 'transparent',
          speed: 1,
          style: {
            width: '500px',
            height: '500px',
            marginTop: '-242px',
            marginLeft: '-178px',
          },
          loop: true,
          autoplay: true,
          class: 'block mx-auto',
        })}
      </div>
    ),
    [],
  );

  return (
    <div className="-mt-8 flex flex-1 flex-col items-center justify-center lg:-mt-12">
      {loader}
      <div className="w-full lg:w-1/2">
        <div className="mt-12 mb-4 text-center text-title-desktop font-bold">
          {t('paymentPendingPage.headerMessage')}
        </div>
        <div className="text-center text-caption text-gray-500">
          {t('paymentPendingPage.description')}
        </div>
      </div>
    </div>
  );
}
