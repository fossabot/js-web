import { defaultTo } from 'lodash';
import React, { FC, useRef, useState } from 'react';
import Button, { ButtonProps } from '../ui-kit/Button';
import { Modal } from './HeadlessModal';
import { Dialog } from '@headlessui/react';
import { Warning } from './icons';
import cx from 'classnames';

export interface IConfirmationModal {
  isOpen: boolean;
  toggle: () => any;
  onOk: () => any;
  onCancel?: () => any;
  header?: React.ReactNode;
  body?: React.ReactNode;
  confirmBtnInner?: React.ReactNode;
  cancelBtnInner?: React.ReactNode;
  confirmBtnProps?: ButtonProps;
  cancelBtnProps?: ButtonProps;
  closable?: boolean;
  logoBodyPadding?: boolean;
  modalClassName?: string;
  avoidFullWidth?: boolean;
}

const ConfirmationModal: FC<IConfirmationModal> = (props) => {
  const {
    isOpen,
    toggle,
    onOk,
    confirmBtnInner,
    cancelBtnInner,
    header,
    body,
    onCancel,
    closable,
    confirmBtnProps,
    cancelBtnProps,
    logoBodyPadding = true,
    modalClassName,
    avoidFullWidth,
  } = props;
  const [isLoading, setLoading] = useState<boolean>(false);
  const initialFocusRef = useRef(null);

  async function handleOk(event: React.MouseEvent) {
    event.preventDefault();
    setLoading(true);
    await onOk();
    setLoading(false);
    toggle();
  }

  async function handleCancel(event: React.MouseEvent) {
    event.preventDefault();
    const func = defaultTo(onCancel, () => null);
    setLoading(true);
    await func();
    setLoading(false);
    toggle();
  }

  return (
    <Modal
      className={cx('px-6 py-8', modalClassName)}
      isOpen={isOpen}
      toggle={toggle}
      skipOutsideClickEvent={!closable}
      initialFocusRef={initialFocusRef}
      skipFullWidth={avoidFullWidth}
    >
      <Dialog.Title
        as="div"
        className="flex items-center space-x-6 text-subheading font-semibold"
      >
        <Warning className="h-8 w-8 flex-shrink-0 text-red-200" />
        <div>{header}</div>
      </Dialog.Title>
      <Dialog.Description as="div" className="mt-4 flex space-x-6">
        {logoBodyPadding && <div className="w-8 flex-shrink-0" />}
        <div className="w-full">{body}</div>
      </Dialog.Description>
      <div className="mt-8 flex">
        <div className="flex-1" />
        <div className="flex flex-1 flex-row-reverse space-x-3 space-x-reverse">
          <Button
            variant="primary"
            type="button"
            size="small"
            onClick={handleOk}
            disabled={isLoading}
            {...confirmBtnProps}
            className={cx(
              'border-none font-semibold',
              { 'bg-red-200': !confirmBtnProps?.variant },
              confirmBtnProps?.className,
            )}
          >
            {confirmBtnInner || 'Yes'}
          </Button>
          <Button
            ref={initialFocusRef}
            variant="secondary"
            type="reset"
            size="small"
            onClick={handleCancel}
            disabled={isLoading}
            {...cancelBtnProps}
            className={cx('font-semibold', cancelBtnProps?.className)}
          >
            {cancelBtnInner || 'No'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
