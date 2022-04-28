import { Dialog } from '@headlessui/react';
import { useRouter } from 'next/router';
import WEB_PATHS from '../constants/webPaths';
import { useResponsive } from '../hooks/useResponsive';
import useTranslation from '../i18n/useTranslation';
import Button from '../ui-kit/Button';
import { Modal } from '../ui-kit/HeadlessModal';
import { Close } from '../ui-kit/icons';
import Picture from '../ui-kit/Picture';

interface IMembershipExpireBookingModalProps {
  isOpen: boolean;
  toggle: () => void;
}

export const MembershipExpireBookingModal = ({
  isOpen,
  toggle,
}: IMembershipExpireBookingModalProps) => {
  const { lg } = useResponsive();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="p-6">
      <Dialog.Title
        as="div"
        className="flex flex-col items-center justify-center space-y-4 space-x-0 lg:flex-row lg:space-y-0 lg:space-x-6"
      >
        <Picture
          sources={[
            {
              srcSet: '/assets/manage-subscription.webp',
              type: 'image/webp',
            },
          ]}
          fallbackImage={{ src: '/assets/manage-subscription.png' }}
        />

        <div className="space-y-4 text-center lg:text-left">
          <div className="flex items-center justify-between space-x-4">
            <h6 className="text-subheading font-semibold text-gray-900">
              {t('courseSessionsPage.membershipExpireSessionTitle')}
            </h6>
            {lg && (
              <Close
                className="h-6 w-6 cursor-pointer text-gray-650 hover:text-gray-600"
                onClick={toggle}
              />
            )}
          </div>
          <p className="text-gray-650">
            {t('courseSessionsPage.membershipExpireSessionDescription')}
          </p>
        </div>
      </Dialog.Title>
      <div className="mt-4 flex flex-row-reverse flex-wrap lg:mt-10">
        <Button
          avoidFullWidth={lg}
          className="ml-0 mb-3 font-semibold lg:ml-4 lg:mb-0"
          size="medium"
          variant="primary"
          type="button"
          onClick={() => {
            router.push(WEB_PATHS.MY_PACKAGES);
          }}
        >
          {t('courseSessionsPage.manageSubscription')}
        </Button>
        <Button
          avoidFullWidth={lg}
          className="font-semibold"
          size="medium"
          variant="secondary"
          type="button"
          onClick={() => {
            toggle();
          }}
        >
          {t('courseSessionsPage.selectAnotherDate')}
        </Button>
      </div>
    </Modal>
  );
};
