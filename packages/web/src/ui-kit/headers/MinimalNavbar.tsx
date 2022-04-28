import React from 'react';
import cx from 'classnames';
import Link from 'next/link';

import Picture from '../Picture';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';

interface IHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

const MinimalNavbar = ({ className }: IHeaderProps) => {
  const { t } = useTranslation();
  return (
    <header
      className={cx('w-full bg-white px-6 py-4 lg:px-8 lg:py-6', className)}
    >
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex flex-shrink-0 items-center text-white">
          <span className="w-12 text-xl font-semibold tracking-tight text-brand-primary lg:w-16">
            <Link href="/">
              <a>
                <Picture
                  fallbackImage={{ src: '/assets/seac-logo-compact.png' }}
                  sources={[
                    {
                      srcSet: '/assets/seac-logo-compact.webp',
                      type: 'image/webp',
                    },
                  ]}
                />
              </a>
            </Link>
          </span>
        </div>
        <div className="text-caption">
          <span className="mr-2">{t('navbar.needHelp')}</span>
          <Link href={WEB_PATHS.HELP_CENTER}>
            <a
              className="font-semibold text-brand-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('navbar.helpCenter')}
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default MinimalNavbar;
