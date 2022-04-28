import { FC, useEffect, useRef, useState } from 'react';
import { Check, Close, InfomrationCircle, Warning } from './icons';
import cx from 'classnames';

export interface IFadeMessage {
  type: 'info' | 'success' | 'error';
  title: React.ReactNode;
  fadeOutSecond?: number;
  hasClose?: boolean;
}

export const DEFAULT_FADE_MESSAGE_TIMEOUT = 5000;

export const FadeMessage: FC<IFadeMessage> = (props) => {
  const { type, title, fadeOutSecond, hasClose } = props;
  const [fade, triggerFade] = useState<boolean>(false);

  const timeoutRef = useRef(0);

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      triggerFade(true);
    }, fadeOutSecond * 1000 || DEFAULT_FADE_MESSAGE_TIMEOUT);
  }, [title]);

  return (
    <div
      className={cx(
        'flex items-center justify-between space-x-4 rounded-lg px-3 py-4 shadow',
        {
          'opacity-0 transition-opacity duration-500': fade,
          'bg-gray-100': type === 'info',
          'bg-green-200 text-white': type === 'success',
          'bg-red-200 text-white': type === 'error',
        },
      )}
    >
      <div className="flex items-center space-x-2">
        <div
          className={cx('rounded-full p-2', {
            'bg-gray-200': type === 'info',
            'bg-green-300': type === 'success',
            'bg-gray-200 text-red-300': type === 'error',
          })}
        >
          {type === 'info' && <InfomrationCircle className="text-black" />}
          {type === 'success' && <Check />}
          {type === 'error' && <Warning />}
        </div>
        <div className="text-caption font-semibold">{title}</div>
      </div>
      {hasClose && (
        <a
          role="button"
          onClick={() => {
            triggerFade(true);
            clearTimeout(timeoutRef.current);
          }}
        >
          <Close className="h-6 w-6" />
        </a>
      )}
    </div>
  );
};
