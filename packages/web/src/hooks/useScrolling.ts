import { useCallback, useEffect, useState } from 'react';

export const useScrolling = () => {
  const [oldScollY, setScrollY] = useState(0);
  const [isUp, setIsUp] = useState(false);

  const scrollHandler = useCallback(() => {
    const scrollY = document.documentElement.getBoundingClientRect().y;
    if (oldScollY <= scrollY) {
      if (!isUp) setIsUp(true);
    } else {
      if (isUp) setIsUp(false);
    }
    setScrollY(scrollY);
  }, [oldScollY, setScrollY, setIsUp]);

  useEffect(() => {
    window.addEventListener('scroll', scrollHandler, { passive: true });

    return () => window.removeEventListener('scroll', scrollHandler);
  }, [scrollHandler]);

  return { isDown: !isUp, isUp };
};
