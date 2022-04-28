import { ToastContainerProps } from 'react-toast-notifications';
import cx from 'classnames';

function ToastContainer({
  children,
  placement = 'top-center',
  hasToasts,
}: ToastContainerProps) {
  return (
    <div
      className={cx(
        'fixed flex w-11/12 flex-col gap-2 lg:w-auto',
        {
          'top-20 left-1/2 -translate-x-1/2 transform':
            placement === 'top-center',
          'top-20 left-8': placement === 'top-left',
          'top-20 right-8': placement === 'top-right',
          'bottom-20 left-1/2 -translate-x-1/2 transform':
            placement === 'bottom-center',
          'bottom-20 left-8': placement === 'bottom-left',
          'bottom-20 right-8': placement === 'bottom-right',
        },
        hasToasts ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      {children}
    </div>
  );
}

export default ToastContainer;
