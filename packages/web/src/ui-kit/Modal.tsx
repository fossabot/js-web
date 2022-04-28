/**
 * Extending Kimia UI Modal
 * TODO create our own modal instead of relying on library
 */

import { useState } from 'react';
import { Modal as KimiaModal, IModal, defaultStyle } from './lib/Modal';
import { IoMdClose } from 'react-icons/io';
import cx from 'classnames';

export function useModal() {
  const [isOpen, setOpen] = useState(false);

  return {
    isOpen,
    toggle() {
      setOpen(!isOpen);
    },
  };
}

export const Modal = ({ ...props }: IModal) => <KimiaModal {...props} />;
Modal.Header = function ModalHeader({
  children,
  toggle,
  withClose = true,
  ...props
}) {
  return (
    <KimiaModal.Header {...props}>
      <div className="flex space-x-4">
        <div className="flex-1">{children}</div>
        {withClose && (
          <div className="self-center">
            <IoMdClose className="cursor-pointer" onClick={toggle} />
          </div>
        )}
      </div>
    </KimiaModal.Header>
  );
};
Modal.Body = KimiaModal.Body;
Modal.Footer = function ModalFooter({ ...props }) {
  const footerStyle = cx('bg-gray-100', defaultStyle.footer);
  return (
    <KimiaModal.Footer style={{ footer: footerStyle }} {...(props as any)} />
  );
};
