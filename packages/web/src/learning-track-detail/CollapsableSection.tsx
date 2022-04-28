import cx from 'classnames';
import { ReactNode } from 'react';
import { Disclosure, Transition } from '@headlessui/react';

import { Minus, Plus } from '../ui-kit/icons';
import useTranslation from '../i18n/useTranslation';

export interface IProps {
  children: ReactNode;
  title: ReactNode;
  buttonClassName?: string;
  defaultOpen?: boolean;
}

export const CollapsableSection: React.FC<IProps> = ({
  children,
  title,
  buttonClassName,
  defaultOpen,
}) => {
  const { t } = useTranslation();

  return (
    <Disclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <>
          <Disclosure.Button
            className={cx(
              'outline-none focus:outline-none flex w-full items-center justify-between rounded-none border border-gray-200 bg-gray-100 px-4 pt-3 pb-4 lg:rounded-2xl',
              {
                'rounded-b-none border-b-0 lg:rounded-b-none lg:border-b-0':
                  open,
              },
              buttonClassName,
            )}
          >
            {title}
            {!open ? (
              <div className="mt-2.5 flex flex-row items-center justify-end text-body text-gray-650">
                <span className="mr-1">
                  {t('learningTrackDetailPage.show')}
                </span>
                <Plus className="h-5 w-5" />
              </div>
            ) : (
              <div className="mt-2.5 flex flex-row items-center justify-end text-body text-gray-650">
                <span className="mr-1">
                  {t('learningTrackDetailPage.hide')}
                </span>
                <Minus className="h-5 w-5" />
              </div>
            )}
          </Disclosure.Button>
          <Transition
            show={open}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel static>{children}</Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
};
