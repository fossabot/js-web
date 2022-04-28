// Custom toast message component for our SnackBar

import React, { FC, ReactNode } from 'react';
import { ToastProps } from 'react-toast-notifications';
import { Close } from './icons';
import cx from 'classnames';

export interface ToastMessageOptions {
  icon?: ReactNode;
  title: ReactNode;
  closable?: boolean;
  className?: string;
  expand?: boolean;
}

interface IToastMessage extends ToastMessageOptions {
  toastProps: ToastProps;
}

export const ToastMessage: FC<IToastMessage> = (props) => {
  const {
    icon,
    title,
    toastProps,
    closable = true,
    className,
    expand = true,
  } = props;
  const { appearance, onDismiss } = toastProps;

  return (
    <div
      className={cx('flex w-96 items-center justify-between', {
        'min-w-256': expand,
        className,
      })}
    >
      <div className="flex items-center space-x-2">
        {icon && (
          <div
            className={cx('rounded-full p-2', {
              'bg-gray-200': appearance === 'info',
              'bg-green-300': appearance === 'success',
              'bg-gray-200 text-red-300': appearance === 'error',
            })}
          >
            {icon}
          </div>
        )}
        <div
          className={cx('text-caption font-semibold', {
            'text-white': appearance !== 'info',
          })}
        >
          {title}
        </div>
      </div>
      <div>
        {closable && (
          <a role="button" onClick={() => onDismiss()}>
            <Close
              className={cx('h-6 w-6', { 'text-white': appearance !== 'info' })}
            />
          </a>
        )}
      </div>
    </div>
  );
};

/**
 * Passing callback to addToast() every time to create a component can be tedious.
 * Use this helper to encapsulate a callback.
 */
export function toastMessage(params: ToastMessageOptions) {
  return function ToastMessageWrapper(toastProps: ToastProps) {
    return <ToastMessage toastProps={toastProps} {...params} />;
  };
}
