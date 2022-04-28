import cx from 'classnames';
import Head from 'next/head';
import DefaultHeader from '../ui-kit/headers/MainNavbar';
import DefaultSidebar from '../ui-kit/sidebars/DefaultSidebar';
import Footer from '../ui-kit/footer/Footer';
import { ITokenProps } from '../models/auth';
import React, { useMemo } from 'react';

export enum SidebarPosition {
  LEFT,
  RIGHT,
}

interface ILayoutProps {
  token?: ITokenProps;
  head?: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  includeSidebar?: boolean;
  sidebarPosition?: SidebarPosition;
  topContent?: React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  mainWrapperClassName?: string;
  boxedContent?: boolean;
  // some pages don't need the implicit padding
  noMobilePadding?: boolean;
}

const defaultHead = (
  <Head>
    <link rel="icon" href="/favicon.ico" />
  </Head>
);
export default function Layout({
  children,
  token,
  className,
  mainWrapperClassName,
  head = defaultHead,
  header = <DefaultHeader token={token} />,
  includeSidebar,
  sidebar = <DefaultSidebar />,
  sidebarPosition = SidebarPosition.LEFT,
  topContent,
  leftContent,
  rightContent,
  boxedContent = false,
  noMobilePadding = false,
}: ILayoutProps) {
  const getSidebar = () => {
    if (!sidebar || !includeSidebar) return null;

    return (
      <aside
        className={cx(
          'w-full flex-shrink-0 bg-gray-100 lg:w-64 lg:border-r lg:border-gray-200',
          'sticky top-15 left-0 z-10 flex flex-col justify-between lg:static',
          sidebarPosition === SidebarPosition.RIGHT && 'order-2',
        )}
      >
        {sidebar}
      </aside>
    );
  };

  const showContentBoxed = useMemo(
    () => (!sidebar || !includeSidebar) && boxedContent,
    [sidebar, includeSidebar, boxedContent],
  );

  return (
    <div className={cx('flex min-h-full flex-col bg-white', className)}>
      {head}
      {header}
      {topContent}
      <div className="flex flex-1 items-stretch">
        {leftContent}
        <div className="flex flex-1 flex-col">
          <div
            className={cx(
              'flex flex-1 flex-col lg:flex-row',
              showContentBoxed ? 'lg:mx-auto lg:w-256' : 'w-full',
            )}
          >
            {getSidebar()}
            <main
              className={cx(
                'order-1 flex flex-1 flex-col lg:mt-0 lg:px-0',
                { 'px-5 py-6 lg:py-8': !noMobilePadding },
                !showContentBoxed && !noMobilePadding && 'px-6 lg:px-8',
                mainWrapperClassName,
              )}
            >
              {children}
            </main>
          </div>
          <Footer />
        </div>
        {rightContent}
      </div>
    </div>
  );
}
