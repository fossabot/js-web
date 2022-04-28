import cx from 'classnames';
import { CSSProperties } from 'react';

interface IBackdropProps {
  show: boolean;
  onClick: () => void;
  className?: string;
  style?: CSSProperties;
}

function Backdrop({ show, onClick, className, style }: IBackdropProps) {
  return (
    <div
      className={cx(
        'fixed left-0 top-0 z-40 h-screen w-screen bg-backdrop-modal transition-opacity duration-300 lg:hidden',
        show ? 'opacity-100' : 'pointer-events-none opacity-0',
        className,
      )}
      style={style}
      onClick={onClick}
    />
  );
}

export default Backdrop;
