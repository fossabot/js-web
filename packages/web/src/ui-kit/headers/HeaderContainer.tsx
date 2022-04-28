import React from 'react';
import Link from 'next/link';
import cx from 'classnames';
import Picture from '../Picture';

interface IHeaderProps {
  className?: string;
  children?: React.ReactNode;
}
const HeaderContainer = ({ className, children }: IHeaderProps) => {
  return (
    <header
      className={cx('sticky top-0 z-50 bg-gray-100 lg:bg-white', className)}
    >
      <div className="mx-auto p-5 lg:w-256 lg:border-b lg:border-gray-300 lg:py-8 xl:px-0">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex flex-shrink-0 items-center text-white">
            <span className="w-16 text-xl font-semibold tracking-tight text-brand-primary">
              <Link href="/">
                <a>
                  <Picture
                    sources={[
                      {
                        srcSet: '/assets/seac-logo-compact.webp',
                        type: 'image/webp',
                      },
                    ]}
                    fallbackImage={{ src: '/assets/seac-logo-compact.png' }}
                  />
                </a>
              </Link>
            </span>
          </div>
          {children}
        </div>
      </div>
    </header>
  );
};

export default HeaderContainer;
