import { useEffect, useMemo, useRef } from 'react';
import { debounce } from 'lodash';

interface IInfiniteScrollArea {
  loading?: boolean;
  onScrollToBottom?: () => void;
  offset?: number;
  children: React.ReactNode;
}

/**
 * Use for detect event when scroll down to bottom of element.
 */
function InfiniteScrollArea({
  loading,
  onScrollToBottom,
  offset = 100,
  children,
}: IInfiniteScrollArea) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const debounceOnScrollToBottom = useMemo(
    () => debounce(onScrollToBottom, 500),
    [onScrollToBottom],
  );

  useEffect(() => {
    function onScroll(e) {
      if (loading || !scrollRef.current) return;

      if (
        e.target.documentElement.scrollTop +
          e.target.documentElement.clientHeight >
        scrollRef.current.offsetTop + scrollRef.current.clientHeight - offset
      ) {
        debounceOnScrollToBottom();
      }
    }

    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [loading]);

  return (
    <div className="w-full" ref={scrollRef}>
      {children}
    </div>
  );
}

export default InfiniteScrollArea;
