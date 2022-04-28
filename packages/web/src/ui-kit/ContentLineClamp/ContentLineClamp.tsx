import cx from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';

import ContentLineClampStyle from './contentLineClamp.module.css';
import useTranslation from '../../i18n/useTranslation';

interface IProps {
  content: string;
  allowLines: number;
  collapsable?: boolean;
  lineHeight?: number;
}

export const ContentLineClamp: FC<IProps> = ({
  content,
  allowLines,
  collapsable,
  lineHeight = 26,
}) => {
  const [isCollapsable, setIsCollapsable] = useState(collapsable);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  const maxContainerHeight = lineHeight * allowLines;

  useEffect(() => {
    if (!containerRef) return;

    if (containerRef.current.clientHeight < maxContainerHeight) {
      setIsCollapsable(false);
    }
  }, [maxContainerHeight]);

  const toggleContent = () => {
    setIsCollapsed((_) => !_);
  };

  return (
    <>
      <div className="relative">
        <div
          className={cx(ContentLineClampStyle.rte, 'overflow-y-hidden')}
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ maxHeight: isCollapsed ? maxContainerHeight : '' }}
        />
        <div
          className={cx(
            'absolute bottom-0 h-5 w-full bg-gradient-to-t from-white',
            { block: isCollapsed, hidden: !isCollapsed || !isCollapsable },
          )}
        />
      </div>
      {isCollapsable && (
        <div className="mt-4 cursor-pointer text-caption font-semibold">
          <span onClick={toggleContent}>
            {isCollapsed ? t('seeMore') : t('seeLess')}
          </span>
        </div>
      )}
    </>
  );
};
