import useTranslation from '../i18n/useTranslation';
import ErrorMessage from './ErrorMessage';

export default function PaymentNotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="-mt-8 flex flex-1 flex-col items-center justify-center lg:-mt-12">
      <ErrorMessage
        title={t('paymentFailurePage.headerMessage')}
        description={t('paymentFailurePage.description')}
      />
    </div>
  );
}
