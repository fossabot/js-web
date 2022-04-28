import cx from 'classnames';
import { ReactNode } from 'react';

import { Disclosure } from '@headlessui/react';

import ChevronDown from './icons/ChevronDown';

export interface IProps {
  children: ReactNode;
  title: ReactNode;
  buttonClassName?: string;
  defaultOpen?: boolean;
}

export const ContentDisclosure: React.FC<IProps> = ({
  children,
  title,
  buttonClassName,
  defaultOpen,
}) => {
  return (
    <div className="w-full py-2">
      <div className="w-full">
        <Disclosure defaultOpen={defaultOpen}>
          {({ open }) => (
            <>
              <Disclosure.Button
                className={cx(
                  'focus:outline-none flex w-full items-center justify-between rounded-lg border border-gray-300 bg-gray-200 px-4 py-3 drop-shadow-md filter hover:border-gray-600',
                  buttonClassName,
                )}
              >
                <span>{title}</span>
                <ChevronDown
                  className={`${open ? 'rotate-180 transform' : ''} h-5 w-5`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="py-2">{children}</Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  );
};
