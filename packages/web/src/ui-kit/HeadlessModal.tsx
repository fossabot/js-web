import {
  Dispatch,
  FC,
  Fragment,
  MutableRefObject,
  ReactNode,
  useState,
} from 'react';
import cx from 'classnames';
import { Dialog, Transition } from '@headlessui/react';

interface IModal {
  className?: string;
  onClose?: (params?: any) => void;
  children: ReactNode;
  skipOutsideClickEvent?: boolean;
  initialFocusRef?: MutableRefObject<any>;
  isOpen: boolean;
  toggle: Dispatch<boolean>;
  skipFullWidth?: boolean;
}

// Based on https://headlessui.dev/react/dialog

export const useModal = (): {
  isOpen: boolean;
  toggle(bool?): void;
} => {
  const [isOpen, setOpen] = useState(false);

  return {
    isOpen,
    toggle(bool?: boolean) {
      setOpen(bool ?? !isOpen);
    },
  };
};

export const Modal: FC<IModal> = ({
  className,
  children,
  skipOutsideClickEvent,
  onClose,
  initialFocusRef,
  isOpen,
  toggle,
  skipFullWidth = false,
}) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog
      as="div"
      className="fixed inset-0 z-50 overflow-y-auto"
      onClose={() => {
        onClose && onClose();
        !skipOutsideClickEvent && toggle(false);
      }}
      initialFocus={initialFocusRef}
    >
      <div className="min-h-screen px-6 text-center">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-20"
          leave="ease-in duration-200"
          leaveFrom="opacity-20"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        </Transition.Child>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span
          className="inline-block h-screen align-middle"
          aria-hidden="true"
        />
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div
            className={cx(
              'inline-block max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all',
              className,
              !skipFullWidth && 'w-full',
            )}
          >
            {children}
          </div>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
);
