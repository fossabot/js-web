import cx from 'classnames';
import Link from 'next/link';

import Button from '../ui-kit/Button';
import Picture from '../ui-kit/Picture';
import { Recycle } from '../ui-kit/icons';
import WEB_PATHS from '../constants/webPaths';
import { formatWithTimezone } from '../utils/date';
import useTranslation from '../i18n/useTranslation';
import { DEFAULT_DATE_FORMAT } from '../constants/datetime';
import { IPackageItemProps } from './interface/ISubscription';

export default function PackageItem({
  subscription,
  expired = false,
}: IPackageItemProps) {
  const { t } = useTranslation();

  if (!subscription) return null;

  const renewPath = WEB_PATHS.PLAN_PAYMENT.replace(
    ':planId',
    subscription.subscriptionPlan.id,
  );

  return (
    <div className="box-content w-full lg:w-136 2xl:odd:pr-3 2xl:even:pl-3">
      <div
        className={cx(
          'mb-6 flex flex-col overflow-hidden rounded-3xl border border-gray-200 p-6 hover:shadow-sm lg:flex-row',
          expired ? 'bg-gray-100' : 'bg-white',
        )}
      >
        <div className="relative mb-6 block h-2/5 w-full flex-shrink-0 overflow-hidden rounded-2xl lg:mr-6 lg:mb-0 lg:h-26 lg:w-26">
          {expired && (
            <div className="absolute h-full w-full rounded-3xl bg-gray-400 opacity-30 lg:rounded-2xl" />
          )}
          <Picture
            className="h-full w-full cursor-pointer object-cover object-center"
            sources={[
              {
                media: '(max-width: 1023px)',
                srcSet: `/assets/packages/default-mobile.webp`,
                type: 'image/webp',
              },
              {
                media: '(min-width: 1024px)',
                srcSet: `/assets/packages/default.webp`,
                type: 'image/webp',
              },
            ]}
            fallbackImage={{
              src: `/assets/packages/default.png`,
              srcSet: `/assets/packages/default-mobile.png, /assets/packages/default.png 1024w`,
            }}
          />
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div className="flex w-full items-center justify-between">
            <div className="flex-1 flex-shrink-0 pb-4">
              <div
                className={cx(
                  'w-full cursor-pointer truncate text-footnote font-semibold uppercase',
                  expired ? 'text-gray-400' : `text-brand-primary`,
                )}
              >
                YourNextU
              </div>
              <div
                className={cx(
                  'mt-2 h-10 w-full text-caption line-clamp-2',
                  expired ? 'text-gray-500' : 'text-black',
                )}
              >
                {subscription?.subscriptionPlan?.name}
              </div>
            </div>
          </div>
          <div
            className={cx(
              'flex flex-wrap items-center justify-between gap-y-2 border-t border-gray-200 text-caption font-semibold lg:flex-nowrap',
              expired ? 'pt-4 lg:pt-2' : 'pt-6 lg:pt-4',
            )}
          >
            <div
              className={cx(
                'mr-2 flex flex-shrink-0 items-center self-center rounded-xl py-0.5 pr-3 pl-2',
                expired
                  ? 'bg-gray-200 text-gray-400'
                  : 'bg-green-100 text-green-200',
              )}
            >
              <div
                className={cx(
                  'mr-2 h-1.5 w-1.5 rounded-full',
                  expired ? 'bg-gray-400' : 'bg-green-200',
                )}
              />
              <span>
                {expired
                  ? t('myPackagesPage.expired')
                  : t('myPackagesPage.activeUntil', {
                      date: formatWithTimezone(
                        new Date(subscription.endDate),
                        DEFAULT_DATE_FORMAT,
                      ),
                    })}
              </span>
            </div>
            <div className={cx(expired ? 'w-24' : '-mr-1 w-20')}>
              {expired ? (
                <Button
                  variant="secondary"
                  size="small"
                  type="button"
                  className="flex-shrink-0 py-2"
                  iconLeft={<Recycle className="text-heading" />}
                >
                  <Link href={renewPath}>
                    <a className="ml-2">Renew</a>
                  </Link>
                </Button>
              ) : (
                <Link href={renewPath}>
                  <a className={`flex items-center text-brand-primary`}>
                    <Recycle className="text-heading" />
                    <span className="ml-2">Renew</span>
                  </a>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
