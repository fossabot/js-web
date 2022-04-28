import cx from 'classnames';
import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';

export interface ITabsProps {
  active: string;
  items: {
    key: string;
    render: (props: { active: boolean }) => ReactNode;
  }[];
  onClick: (key: string) => void;
  className?: string;
  rounded?: boolean;
}

export const Tabs = ({
  active,
  onClick,
  items,
  className,
  rounded = true,
}: ITabsProps) => {
  const [style, setStyle] = useState<CSSProperties>({});
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const el = activeRef.current;
    if (el && el instanceof HTMLElement) {
      setStyle({
        height: 2,
        width: el.clientWidth,
        left: el.offsetLeft,
      });
    }
  }, [active]);

  return (
    <div className={cx('relative', className)}>
      <div
        className={cx(
          'flex w-full items-center space-x-6 border border-gray-200 px-4 lg:space-x-8 lg:px-6',
          {
            'rounded-2xl': rounded,
          },
        )}
      >
        {items.map((item) => {
          const isActive = active === item.key;

          return (
            <a
              ref={isActive ? activeRef : undefined}
              key={item.key}
              role="button"
              data-tab={item.key}
              onClick={() => onClick(item.key)}
              className={cx('py-4 px-1 text-sm font-medium', {
                'text-gray-500': !isActive,
                'text-brand-primary': isActive,
              })}
            >
              {item.render({ active: isActive })}
            </a>
          );
        })}
      </div>
      <div
        className="absolute bottom-0 bg-brand-primary transition-all"
        style={style}
      />
    </div>
  );
};
