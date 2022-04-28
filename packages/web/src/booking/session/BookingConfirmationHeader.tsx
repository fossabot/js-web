import Link from 'next/link';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';
import Button from '../../ui-kit/Button';
import Picture from '../../ui-kit/Picture';

const BookingConfirmationHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col justify-between px-6 lg:flex-row lg:items-center lg:px-0">
      <div className="flex flex-col lg:flex-row">
        <Picture
          className="h-16 w-16"
          sources={[
            {
              srcSet: '/assets/booking/session/booking-session-complete.webp',
              type: 'image/webp',
            },
          ]}
          fallbackImage={{
            src: '/assets/booking/session/booking-session-complete.png',
          }}
        />
        <div className="flex flex-col justify-center lg:ml-4">
          <p className="mt-2.5 text-subtitle font-bold text-black">
            {t('courseBookingConfirmationPage.completed')}
          </p>
          <p className="mt-1 text-body font-semibold text-gray-650">
            {t('courseBookingConfirmationPage.recheck')}
          </p>
        </div>
      </div>

      <Link href={WEB_PATHS.DASHBOARD} passHref>
        <a className="focus:outline-none mt-6 mb-8 w-2/4 lg:mt-0 lg:mb-0 lg:w-3/12">
          <Button
            variant="primary"
            type="button"
            size="small"
            className="focus-visible:outline-none"
          >
            <p className="text-caption font-semibold text-white">
              {t('courseBookingConfirmationPage.myDashboard')}
            </p>
          </Button>
        </a>
      </Link>
    </div>
  );
};

export default BookingConfirmationHeader;
