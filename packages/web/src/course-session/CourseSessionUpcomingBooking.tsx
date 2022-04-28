import { FC, useState } from 'react';
import { UserUpcomingBooking } from '../models/course-session';
import { format } from 'date-fns';
import Link from 'next/link';
import WEB_PATHS from '../constants/webPaths';
import { ArrowRight, ChevronLeft, ChevronRight } from '../ui-kit/icons';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import cx from 'classnames';
import config from '../../tailwind.config';
import resolveConfig from 'tailwindcss/resolveConfig';
import { TOptionsEvents } from 'keen-slider';
import useTranslation from '../i18n/useTranslation';

const { theme } = resolveConfig(config);

interface IUpcomingBookingItem {
  booking: UserUpcomingBooking;
  totalBookings: number;
}

const UpcomingBookingItem: FC<IUpcomingBookingItem> = ({
  booking,
  totalBookings,
}) => {
  return (
    <div
      className={cx(
        'flex h-full w-full flex-col rounded-2xl border border-gray-200 py-4 lg:py-6',
        {
          'px-4 lg:px-14': totalBookings > 1,
          'px-4 lg:px-6': totalBookings === 1,
        },
      )}
    >
      <div className="flex flex-row flex-wrap items-center space-x-2">
        <span className="text-body font-bold text-black lg:text-subheading">
          {format(
            new Date(booking.startDateTime),
            'dd MMM yy (EEE)',
          ).toLocaleUpperCase()}
        </span>
        <span className="text-body font-regular text-gray-500">
          {`${format(new Date(booking.startDateTime), 'HH:mm')} - 
          ${format(new Date(booking.endDateTime), 'HH:mm')}`}
        </span>
      </div>
      <p className="text-caption font-regular text-gray-650 lg:text-body">
        {booking.title}
      </p>
    </div>
  );
};

interface ICourseSessionUpcomingBooking {
  bookings: UserUpcomingBooking[];
}

const CourseSessionUpcomingBooking: FC<ICourseSessionUpcomingBooking> = ({
  bookings,
}) => {
  const keenSliderOptions: TOptionsEvents = {
    loop: false,
    slidesPerView: 1,
    spacing: 24,
    initial: 0,
    centered: true,
    dragSpeed: bookings.length === 1 ? 0 : 1,
    breakpoints: {
      [`(max-width: ${theme.screens.lg})`]: {
        slidesPerView: 1.2,
      },
    },
    slideChanged(slider) {
      setCurrentSlide(slider.details().relativeSlide);
    },
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useTranslation();
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>(keenSliderOptions);

  if (bookings.length <= 0) return null;

  return (
    <div className="mt-7 flex w-full flex-col lg:mt-0">
      <div className="mb-4 flex flex-row justify-between px-6 lg:px-0">
        <p className="text-subheading font-semibold text-black">
          {t('courseSessionsPage.myUpcomingBooking')}
        </p>
        <Link href={WEB_PATHS.DASHBOARD_BOOKINGS} passHref>
          <a className="flex flex-row items-center space-x-1 text-caption font-semibold text-brand-primary lg:text-body">
            <span>{t('courseSessionsPage.seeAll')}</span>
            <ArrowRight className="h-5 w-5" />
          </a>
        </Link>
      </div>
      <div
        ref={sliderRef}
        className={cx('keen-slider relative text-gray-650', {
          'px-6 lg:px-0': bookings.length === 1,
        })}
      >
        {bookings.length > 1 && (
          <ChevronLeft
            className={cx(
              'absolute top-1/2 z-1 h-8 w-8 -translate-y-1/2 transform',
              'hidden transition-colors lg:flex',
              {
                'text-gray-400': currentSlide === 0,
                'cursor-pointer hover:text-gray-500': currentSlide !== 0,
              },
            )}
            onClick={() => slider.prev()}
          />
        )}

        {bookings.map((booking) => (
          <div className="keen-slider__slide" key={booking.id}>
            <UpcomingBookingItem
              booking={booking}
              totalBookings={bookings.length}
            />
          </div>
        ))}

        {bookings.length > 1 && (
          <ChevronRight
            className={cx(
              'absolute top-1/2 right-0 h-8 w-8 -translate-y-1/2 transform',
              'hidden transition-colors lg:flex',
              {
                'text-gray-400': bookings.length - 1 === currentSlide,
                'cursor-pointer hover:text-gray-500':
                  bookings.length - 1 !== currentSlide,
              },
            )}
            onClick={() => slider.next()}
          />
        )}
      </div>

      {bookings.length > 1 && (
        <div className="mt-4 flex flex-row justify-center space-x-2">
          {Array.from('0'.repeat(bookings.length)).map((_, idx) => (
            <div
              key={idx}
              className={cx(
                'h-1.5 w-1.5 cursor-pointer rounded-full transition-colors',
                {
                  'bg-brand-primary': currentSlide === idx,
                  'bg-gray-300 hover:bg-gray-400': currentSlide !== idx,
                },
              )}
              onClick={() => slider.moveToSlide(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseSessionUpcomingBooking;
