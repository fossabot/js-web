import { Dispatch, FC, ReactNode, useEffect, useState } from 'react';
import useInterval from 'use-interval';

export interface ITimer {
  seconds: number;
  onTimeout: Dispatch<void>;
  pause?: boolean;
  children?: ((remaining: number) => ReactNode) | ReactNode;
}

export const CountdownTimer: FC<ITimer> = (props) => {
  const { seconds, onTimeout, children, pause } = props;
  const [remaining, setRemaining] = useState<number>(-1);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining === 0) {
      onTimeout && onTimeout();
    }
  }, [remaining]);

  useInterval(
    () => {
      setRemaining((remaining) => remaining - 1);
    },
    !pause && remaining > 0 ? 1000 : null,
  );

  if (typeof children === 'function') {
    return children(remaining < 0 ? 0 : remaining);
  }
  return children;
};
