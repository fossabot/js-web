import cx from 'classnames';
import { ToastProps } from 'react-toast-notifications';
import { isFunction } from 'lodash';

function SnackBar(toastProps: ToastProps) {
  const {
    children,
    appearance = 'info',
    transitionState,
    onMouseEnter,
    onMouseLeave,
  } = toastProps;

  return (
    <div
      className={cx(
        'w-full select-none overflow-hidden rounded-2xl px-6 py-4 text-caption font-semibold shadow',
        {
          'border border-gray-200 bg-gray-100 text-black':
            appearance === 'info',
          'border-green-300 bg-green-200 text-white': appearance === 'success',
          'bg-red-200 text-black': appearance === 'error',
          'border-yellow-300 bg-yellow-200 text-black':
            appearance === 'warning',
          'opacity-0 transition-opacity duration-500':
            transitionState === 'exiting',
        },
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isFunction(children) ? children(toastProps) : children}
    </div>
  );
}

export default SnackBar;
