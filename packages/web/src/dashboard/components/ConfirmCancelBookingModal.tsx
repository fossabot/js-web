import { Dialog } from '@headlessui/react';
import cx from 'classnames';
import { Dispatch, FC } from 'react';
import { useLocaleText } from '../../i18n/useLocaleText';
import useTranslation from '../../i18n/useTranslation';
import {
  ICourseSessionBooking,
  RelatedCoursesCancellationResponse,
} from '../../models/course';
import { Language } from '../../models/language';
import Button from '../../ui-kit/Button';
import { Modal } from '../../ui-kit/HeadlessModal';
import { Warning } from '../../ui-kit/icons';
import Picture from '../../ui-kit/Picture';

export interface IConfirmCancelBookingModal {
  isOpen: boolean;
  toggle: Dispatch<boolean>;
  onOk: Dispatch<void>;
  loading?: boolean;
  modalData?: RelatedCoursesCancellationResponse<Language> | undefined;
  outline: ICourseSessionBooking<Language>['outline'];
}

export const ConfirmCancelBookingModal: FC<IConfirmCancelBookingModal> = (
  props,
) => {
  const { toggle, onOk, loading, modalData, outline } = props;
  const { t } = useTranslation();
  const localeText = useLocaleText();

  return (
    <Modal
      {...props}
      className={cx('p-5 lg:w-max', {
        'lg:max-w-lg lg:p-8': modalData?.relatedBookings.length !== 0,
      })}
      skipOutsideClickEvent={loading}
    >
      <Dialog.Overlay />

      {/* Case no affected bookings */}
      <div
        className={cx('', {
          hidden: modalData?.relatedBookings.length !== 0,
        })}
      >
        <Dialog.Title
          as="div"
          className="lg:inline-flex lg:items-center lg:space-x-5"
        >
          <Warning
            className="m-auto text-red-200 lg:scale-75 lg:transform"
            width={50}
            height={50}
          />
          <div className="mt-5 text-center text-subheading font-semibold lg:mt-0">
            {t('dashboardBookingsWaitingRoom.confirmModal.title')}
          </div>
        </Dialog.Title>
        <ul className="mt-2 ml-5 list-disc text-caption text-gray-650 lg:ml-20">
          <li>{t('dashboardBookingsWaitingRoom.confirmModal.noAccess')}</li>
          <li>{t('dashboardBookingsWaitingRoom.confirmModal.canRebook')}</li>
        </ul>
        <div className="mt-8 space-y-4 lg:flex lg:flex-row-reverse lg:space-y-0">
          <div className="max-w-25 lg:ml-3">
            <Button
              size="medium"
              variant="ghost"
              className="bg-red-200 font-semibold text-white focus-visible:ring-red-200"
              onClick={() => onOk()}
              disabled={loading}
              isLoading={loading}
            >
              {t('dashboardBookingsWaitingRoom.confirmModal.confirm')}
            </Button>
          </div>
          <div className="max-w-25">
            <Button
              size="medium"
              variant="secondary"
              className="font-semibold"
              onClick={() => toggle(false)}
              disabled={loading}
            >
              {t('dashboardBookingsWaitingRoom.confirmModal.keepThisBooking')}
            </Button>
          </div>
        </div>
      </div>

      {/* Case >= 1 affected bookings */}
      <div
        className={cx('flex flex-col', {
          hidden: modalData?.relatedBookings.length === 0,
        })}
      >
        <Dialog.Title
          as="div"
          className="lg:inline-flex lg:items-center lg:space-x-5"
        >
          <div className="text-subheading font-semibold lg:mt-0">
            {t('dashboardBookingsWaitingRoom.confirmModal.areYouSure')}
          </div>
        </Dialog.Title>
        <p className="mt-1 text-caption font-regular text-red-200 lg:text-body">
          {t('dashboardBookingsWaitingRoom.confirmModal.preBookWarning')}
        </p>
        <SessionCard modalData={modalData} outline={outline} />
        <p className="mt-4 text-body font-regular text-black lg:mt-6">
          {t('dashboardBookingsWaitingRoom.confirmModal.cancelWarning1')}
          <span className="font-semibold text-red-200">{` ${
            modalData?.relatedBookings.length
          } ${
            modalData?.relatedBookings.length > 1
              ? t('dashboardBookingsWaitingRoom.sessions')
              : t('dashboardBookingsWaitingRoom.session')
          } `}</span>
          {t('dashboardBookingsWaitingRoom.confirmModal.cancelWarning2')}
        </p>
        <div
          className={cx(
            'mt-4 flex flex-col divide-y divide-gray-200 overflow-y-scroll rounded-2xl border border-gray-200 bg-gray-100 px-4 lg:mt-6',
            {
              'justify-center': modalData?.relatedBookings.length === 1,
            },
          )}
          style={{ minHeight: '70px', maxHeight: '213px' }}
        >
          {modalData?.relatedBookings.map((rb) => (
            <p
              key={rb.sessionId}
              className="flex py-4 text-caption font-semibold text-black"
            >
              {localeText(rb.outline.title)}
            </p>
          ))}
        </div>
        <div className="mt-6 w-full space-y-4 lg:mt-8 lg:flex lg:flex-row-reverse lg:space-y-0">
          <div className="w-full lg:ml-4">
            <Button
              size="medium"
              variant="ghost"
              className="bg-red-200 font-semibold text-white focus-visible:ring-red-200"
              onClick={() => onOk()}
              disabled={loading}
              isLoading={loading}
            >
              {t('dashboardBookingsWaitingRoom.confirmModal.cancelBooking')}
            </Button>
          </div>
          <div className="w-full">
            <Button
              size="medium"
              variant="secondary"
              className="font-semibold"
              onClick={() => toggle(false)}
              disabled={loading}
            >
              {t('dashboardBookingsWaitingRoom.confirmModal.keepThisBooking')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const SessionCard: FC<
  Pick<IConfirmCancelBookingModal, 'modalData' | 'outline'>
> = ({ modalData, outline }) => {
  const localeText = useLocaleText();

  return (
    <div className="mt-6 flex flex-row items-center rounded-2xl border border-gray-200 bg-gray-100 p-4">
      {!modalData?.course.imageKey ? (
        <Picture
          className="h-20 w-20 rounded-lg"
          sources={[
            {
              srcSet: '/assets/course/course-default.webp',
              type: 'image/webp',
            },
          ]}
          fallbackImage={{
            src: '/assets/course/course-default.png',
            alt: localeText(outline.title),
          }}
        />
      ) : (
        <img
          src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${modalData?.course.imageKey}`}
          className="h-20 w-20 rounded-lg"
          alt={localeText(outline.title)}
        />
      )}
      <p className="ml-4 text-caption font-semibold text-black">
        {localeText(outline.title)}
      </p>
    </div>
  );
};
