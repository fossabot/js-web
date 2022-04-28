import { useRouter } from 'next/router';
import { Dispatch, useState } from 'react';
import config from '../config';
import useTranslation from '../i18n/useTranslation';
import { SubscriptionPlan } from '../models/subscriptionPlan';
import Button from './Button';
import { Modal, useModal } from './HeadlessModal';
import { ArrowRight, Close } from './icons';
import Picture from './Picture';

export type CheapestPlan = Pick<SubscriptionPlan, 'id' | 'name'> | null;

type PlanUpgradeModalProps = ReturnType<typeof useModal> & {
  cheapestPlan: CheapestPlan;
  setCheapestPlan: Dispatch<CheapestPlan>;
  canUpgrade: boolean;
  setCanUpgrade: Dispatch<boolean>;
};

export const usePlanUpgradeModal = () => {
  const { isOpen, toggle } = useModal();

  const [canUpgrade, setCanUpgrade] = useState(true);
  const [cheapestPlan, setCheapestPlan] = useState<CheapestPlan | null>(null);

  return {
    isOpen,
    cheapestPlan,
    toggle,
    setCheapestPlan,
    canUpgrade,
    setCanUpgrade,
  };
};

export default function PlanUpgradeModal({
  cheapestPlan,
  canUpgrade,
  setCanUpgrade,
  toggle,
  isOpen,
  setCheapestPlan,
}: PlanUpgradeModalProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { locale, defaultLocale } = router;
  const YNU_PACKAGE_PAGE = `${config.CORPORATE_WEB_BASE_URL}/${
    locale || defaultLocale
  }/yournextu/packages`;

  const hide = () => {
    toggle();
    // let animation transition before removing rendered state
    setTimeout(() => {
      setCanUpgrade(false);
      setCheapestPlan(null);
    }, 200);
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      skipFullWidth
      className="w-344px p-5 lg:w-100 lg:px-8 lg:pt-8 lg:pb-6"
    >
      <div className="mb-4 flex flex-col items-center lg:mb-8 lg:flex-row lg:items-start">
        <div className="mb-4 w-25 flex-shrink-0 lg:mb-0 lg:mr-6">
          <Picture
            sources={[
              {
                srcSet: '/assets/plan-upgrade.webp',
                type: 'image/webp',
              },
            ]}
            fallbackImage={{ src: '/assets/plan-upgrade.png' }}
          />
        </div>
        <div className="flex w-full flex-col">
          <div className="flex w-full justify-center lg:justify-between">
            <span className="text-subheading font-semibold text-gray-900">
              {t('courseDetailPage.planUpgradeModal.planUpgradeRequired')}
            </span>
            <Close
              className="hidden h-6 w-6 cursor-pointer text-gray-650 hover:text-gray-600 lg:block"
              onClick={() => hide()}
            />
          </div>
          {cheapestPlan && (
            <div className="mt-4 text-center lg:text-left">
              {t('courseDetailPage.planUpgradeModal.message.prefix')}{' '}
              <a
                {...(canUpgrade
                  ? {
                      target: '_blank',
                      rel: 'noreferrer',
                      href: YNU_PACKAGE_PAGE,
                    }
                  : {})}
                className="mx-0.5 font-semibold text-brand-primary"
              >
                {cheapestPlan.name}
              </a>{' '}
              {t('courseDetailPage.planUpgradeModal.message.postfix')}
            </div>
          )}

          {!canUpgrade && (
            <div className="mt-4">
              <span>
                {t('courseDetailPage.planUpgradeModal.cannotUpgrade')}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col-reverse justify-end lg:flex-row">
        <Button
          avoidFullWidth
          className="font-semibold lg:mr-2"
          size="medium"
          variant="secondary"
          type="button"
          onClick={() => hide()}
        >
          {t('cancel')}
        </Button>
        {canUpgrade && (
          <Button
            avoidFullWidth
            className="mb-3 font-semibold lg:ml-2 lg:mb-0"
            size="medium"
            variant="primary"
            type="button"
            onClick={() => (window.location.href = YNU_PACKAGE_PAGE)}
            iconRight={
              <ArrowRight className="ml-1 h-5 w-5 font-semibold text-white" />
            }
          >
            {t('courseDetailPage.planUpgradeModal.upgradeNow')}
          </Button>
        )}
      </div>
    </Modal>
  );
}
