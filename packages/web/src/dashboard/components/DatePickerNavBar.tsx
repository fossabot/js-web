import React, { FC, ReactNode } from 'react';
import cx from 'classnames';
import { Calendar, ChevronDown, Close } from '../../ui-kit/icons';
import { useModal } from '../../ui-kit/Modal';

export interface IDatePickerNavBar {
  title: ReactNode;
  className?: string;
}

export const DatePickerNavBar: FC<IDatePickerNavBar> = (props) => {
  const { className, title, children } = props;
  const { isOpen, toggle } = useModal();

  return (
    <div
      className={cx(
        ' z-40 w-full border-b border-gray-200 bg-white',
        className,
      )}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        onClick={toggle}
      >
        <span className="flex items-center">
          <Calendar className="mr-4 h-5 w-5" /> {title}
        </span>
        <div className="relative h-6 w-6">
          <Close
            className={cx(
              'absolute top-0 left-0 h-6 w-6 cursor-pointer transition-opacity duration-300',
              isOpen ? 'opacity-100' : 'opacity-0',
            )}
          />
          <ChevronDown
            className={cx(
              'absolute top-0 left-0 h-6 w-6 cursor-pointer transition-opacity duration-300',
              isOpen ? 'opacity-0' : 'opacity-100',
            )}
          />
        </div>
      </div>
      <div className="absolute w-full">{isOpen && children}</div>
    </div>
  );
};
