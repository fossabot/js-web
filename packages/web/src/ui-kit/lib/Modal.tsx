// https://kimia-ui.vercel.app/components/modal

import { useEffect, useRef } from 'react';
import Portal from '@reach/portal';

export const defaultStyle: ModalStyle = {
  container: `fixed top-0 overflow-y-auto left-0 z-50 w-full h-full m-0`,
  content: `relative flex flex-col bg-white pointer-events-auto rounded-lg overflow-hidden`,
  orientation: `mt-12 mx-8 pb-6 md:m-auto md:w-6/12 lg:w-4/12 md:pt-20 focus:outline-none`,
  overlay: `fixed top-0 left-0 z-50 w-screen h-screen bg-black opacity-50`,
  header: `items-start justify-between px-8 py-6`,
  headerTitle: `text-subheading font-semibold`,
  body: `flex-shrink flex-grow px-8`,
  footer: `flex flex-wrap items-center justify-end px-8 py-6`,
};
interface ModalStyle {
  container: string;
  content: string;
  orientation: string;
  overlay: string;
  header: string;
  headerTitle: string;
  body: string;
  footer: string;
}
export interface IModal {
  children: React.ReactNode;
  isOpen: boolean;
  toggle: (value?: boolean) => void;
  style?: Partial<ModalStyle>;
  skipOutsideClickEvent?: boolean;
}
export const Modal = ({
  children,
  isOpen,
  toggle,
  skipOutsideClickEvent = false,
  style = defaultStyle,
}: IModal) => {
  const ref = useRef<HTMLDivElement>();
  // close modal when you click outside the dialog
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!skipOutsideClickEvent && !ref.current?.contains(event.target)) {
        if (!isOpen) return;
        toggle(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [isOpen, ref]);
  // close modal when you click on "ESC" key
  useEffect(() => {
    const handleEscape = (event) => {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        toggle(false);
      }
    };
    document.addEventListener('keyup', handleEscape);
    return () => document.removeEventListener('keyup', handleEscape);
  }, [isOpen]);
  // Put focus on modal dialogue, hide scrollbar and prevent body from moving when modal is open
  useEffect(() => {
    if (!isOpen) return;
    ref.current?.focus();
    const overflow = document.documentElement.style.overflow;
    const paddingRight = document.documentElement.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.documentElement.style.overflow = overflow;
      document.documentElement.style.paddingRight = paddingRight;
    };
  }, [isOpen]);
  return (
    <Portal>
      {isOpen && (
        <>
          <div className={style.overlay} />
          <div className={style.container}>
            <div
              aria-modal={true}
              className={style.orientation}
              ref={ref}
              role="dialogue"
              tabIndex={-1}
            >
              <div className={style.content}>{children}</div>
            </div>
          </div>
        </>
      )}
    </Portal>
  );
};
export interface IModalHeader {
  children: React.ReactNode;
  style?: Partial<{ header: string; headerTitle: string }>;
}
Modal.Header = ({ children, style = defaultStyle }: IModalHeader) => (
  <div className={style.header}>
    <h4 className={style.headerTitle}>{children}</h4>
  </div>
);
export interface IModalBody {
  children: React.ReactNode;
  style?: Partial<{ body: string }>;
}
Modal.Body = ({ children, style = defaultStyle }: IModalBody) => (
  <div className={style.body}>{children}</div>
);
export interface IModalFooter {
  children: React.ReactNode;
  style?: Partial<{ footer: string }>;
}
Modal.Footer = ({ children, style = defaultStyle }: IModalFooter) => (
  <div className={style.footer}>{children}</div>
);
