import useTranslation from '../i18n/useTranslation';
import Button from '../ui-kit/Button';
import { Printer } from '../ui-kit/icons';

interface IPaymentSuccessHeader {
  name: string;
}

export default function PaymentSuccessHeader({ name }: IPaymentSuccessHeader) {
  const { t } = useTranslation();

  const onClickPrint = (e) => {
    e.preventDefault();
    window.print();
  };

  return (
    <div className="mb-8 px-3 lg:mb-12 lg:flex lg:px-0">
      <div className="flex-1">
        <h1 className="text-subtitle font-bold">
          {t('paymentSuccessPage.headerMessage', { name })}
        </h1>
        <h2 className="text-subtitle font-bold">
          {t('paymentSuccessPage.subHeaderMessage')}
        </h2>
      </div>
      <div className="mt-8 lg:mt-0 lg:w-4/12">
        <div className="flex lg:justify-end">
          {/* TODO: Implement PDF generation */}
          {/* <div className="mr-4">
            <Button variant="secondary" type="button" size="small">
              <MdCloudDownload className="mr-2" />
              <span>PDF</span>
            </Button>
          </div> */}
          <div>
            <Button
              variant="secondary"
              type="button"
              size="small"
              onClick={onClickPrint}
            >
              <Printer className="mr-2 text-gray-700" />
              <span>Print</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
