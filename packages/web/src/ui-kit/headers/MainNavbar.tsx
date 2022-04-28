import cx from 'classnames';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthInfo } from '../../app-state/useAuthInfo';
import WEB_PATHS from '../../constants/webPaths';
import { withCatalogMenu } from '../../hooks/useCatalogMenu';
import { useResponsive } from '../../hooks/useResponsive';
import useTranslation from '../../i18n/useTranslation';
import { ITokenProps } from '../../models/auth';
import Backdrop from '../Backdrop';
import { Close, Menu, OutlineBell, Search } from '../icons';
import ChevronDown from '../icons/ChevronDown';
import ChevronRight from '../icons/ChevronRight';
import Logo from '../icons/Logo';
import CatalogMenu from './CatalogMenu';
import { NotificationBubble } from './NotificationBubble';
import { NotificationMenu } from './NotificationMenu';
import SearchBar from './SearchBar';
import { UserMenu } from './UserMenu';
import useSearchBar from './useSearchBar';
import { NotificationContext } from '../../app-state/notificationContext';
import { useContext } from 'react';
import { useRouter } from 'next/router';

export interface IHeaderProps {
  token?: ITokenProps;
  className?: string;
  children?: React.ReactNode;
  scrollOffset?: number;
  theme?: 'default' | 'dark' | 'transparent';
  catalogMenuRef?: React.MutableRefObject<any>;
  hamburgerRef?: React.MutableRefObject<any>;
}

interface INavLink {
  href?: string;
  children?: React.ReactNode;
  rightIcon?: React.ReactNode;
  outerContent?: React.ReactNode;
  onClick?: () => void;
}

const NavLink = React.forwardRef<any, INavLink>(
  ({ href, onClick, rightIcon, children, outerContent }, ref) => {
    return (
      <div
        className="w-full cursor-pointer select-none p-4 lg:relative lg:w-auto lg:py-0 lg:px-3.5 xl:px-6"
        ref={ref}
      >
        {href ? (
          <Link href={href}>
            <a
              className="flex w-full items-center justify-between"
              onClick={onClick}
            >
              {children} {rightIcon}
            </a>
          </Link>
        ) : (
          <span
            className="flex w-full items-center justify-between"
            onClick={onClick}
          >
            {children} {rightIcon}
          </span>
        )}
        {outerContent}
      </div>
    );
  },
);

NavLink.displayName = 'NavLink';

const MainNavBar: React.FunctionComponent<IHeaderProps> = ({
  className,
  token,
  theme = 'default',
  scrollOffset = 30,
  catalogMenuRef: catalogMenuRefProp,
  hamburgerRef,
}: IHeaderProps) => {
  const { t } = useTranslation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCatalogMenu, setShowCatalogMenu] = useState(false);
  const [isScroll, setIsScroll] = useState(false);
  const defaultCatalogMenuItemRef = useRef(null);
  const catalogMenuItemRef = catalogMenuRefProp || defaultCatalogMenuItemRef;
  const searchBarProps = useSearchBar({ showSearch });
  const { lg } = useResponsive();
  const { notificationCount } = useContext(NotificationContext);

  const router = useRouter();

  const toggleCatalogMenu = () => {
    setShowCatalogMenu(!showCatalogMenu);
  };

  const handleClickProfilePicture = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleClickNotificationBubble = () => {
    setShowNotificationMenu(!showNotificationMenu);
  };

  const handleToggleMobileMenu = () => {
    if (showSearch) {
      setShowSearch(false);
    } else {
      setShowMobileMenu(!showMobileMenu);
    }
  };

  const handleClickSearch = () => {
    setShowSearch(true);
    if (showMobileMenu) {
      setShowMobileMenu(false);
    }
  };

  const isAuthenticated = () => {
    return Boolean(token);
  };
  const { isLoading } = useAuthInfo();

  const isOnTop = useMemo(
    () => theme === 'transparent' && !isScroll && !showMobileMenu,
    [theme, isScroll, showMobileMenu],
  );

  useEffect(() => {
    if (!showMobileMenu) {
      setShowCatalogMenu(false);
    }
  }, [showMobileMenu]);

  const detectScrolling = () => {
    const y = window.scrollY;
    if (!isScroll && y > scrollOffset) {
      setIsScroll(true);
    } else {
      setIsScroll(false);
    }
  };
  useEffect(() => {
    if (theme === 'transparent') {
      window.addEventListener('scroll', detectScrolling, true);
      return () => {
        window.removeEventListener('scroll', detectScrolling, true);
      };
    }
  }, [theme]);

  useEffect(() => {
    if (lg) {
      setShowSearch(false);
    }
  }, [lg]);

  return withCatalogMenu(
    <>
      <header
        data-id="main-navbar"
        className={cx(
          'sticky top-0 z-50 box-content h-16 w-full border-b lg:h-auto',
          {
            'border-gray-200 bg-gray-100 lg:bg-white':
              theme === 'default' || (theme === 'transparent' && !isOnTop),
            'border-black bg-black text-white': theme === 'dark',
            'border-black-transparent-200 bg-black-transparent-100 text-white':
              theme === 'transparent' && isOnTop,
          },
          className,
        )}
      >
        <div className="relative h-full">
          <div className="h-full py-2 px-5 lg:py-3.5 lg:pr-8 xl:pl-8">
            <div className="flex h-full flex-wrap items-center justify-between lg:justify-start">
              <div
                className={cx(
                  'flex flex-shrink-0 items-center text-white transition-all duration-300',
                  showSearch ? 'w-0' : 'w-12 lg:w-16',
                )}
              >
                <span
                  className={cx(
                    'block w-full text-xl font-semibold tracking-tight',
                    {
                      'text-white':
                        theme === 'dark' ||
                        (theme === 'transparent' && isOnTop),
                      'text-brand-primary':
                        theme === 'default' ||
                        (theme === 'transparent' && !isOnTop),
                    },
                  )}
                >
                  <Link href={WEB_PATHS.DASHBOARD}>
                    <a>
                      <Logo />
                    </a>
                  </Link>
                </span>
              </div>
              <div className="flex-1 text-caption">
                {isLoading ? (
                  <></>
                ) : (
                  <>
                    {isAuthenticated() && (
                      <>
                        <div className="flex flex-1 items-center justify-end lg:hidden">
                          <div
                            className={cx(
                              'mr-2 rounded-full p-1',
                              router.pathname === WEB_PATHS.NOTIFICATION &&
                                'bg-gray-200',
                              showSearch || showMobileMenu ? 'hidden' : 'block',
                            )}
                          >
                            <OutlineBell
                              className={cx(
                                'block cursor-pointer text-heading',
                                {
                                  'text-white':
                                    theme === 'dark' ||
                                    (theme === 'transparent' && isOnTop),
                                  'text-black':
                                    theme === 'default' ||
                                    (theme === 'transparent' && !isOnTop),
                                },
                              )}
                              onClick={() => {
                                if (router.pathname === WEB_PATHS.NOTIFICATION)
                                  router.back();
                                //redirect back if user clicks on bell icon when in notification page on mobile
                                else router.push(WEB_PATHS.NOTIFICATION);
                              }}
                            />
                            <NotificationBubble />
                          </div>
                          {showSearch && (
                            <SearchBar className="w-full" {...searchBarProps} />
                          )}
                          <Search
                            className={cx(
                              'mr-4 h-6 transition-all duration-300',
                              showSearch
                                ? 'pointer-events-none w-0 opacity-0'
                                : 'w-6',
                            )}
                            onClick={handleClickSearch}
                          />
                          <div
                            className="h-6 w-6"
                            onClick={handleToggleMobileMenu}
                            ref={hamburgerRef}
                          >
                            <Close
                              className={cx(
                                'transition-all duration-300 ease-in-out',
                                showSearch || showMobileMenu
                                  ? 'opacity-1 h-6 w-6'
                                  : 'h-0 w-0 opacity-0',
                              )}
                            />
                            <Menu
                              className={cx(
                                'transition-all duration-300 ease-in-out',
                                showSearch || showMobileMenu
                                  ? 'h-0 w-0 opacity-0'
                                  : 'opacity-1 h-6 w-6',
                              )}
                            />
                          </div>
                        </div>
                        <div
                          className={cx(
                            'flex w-full flex-col text-caption font-medium lg:w-auto lg:flex-row lg:items-center',
                            'absolute right-0 z-10 lg:static lg:ml-10',
                            'bg-white text-black transition-all duration-300 ease-in-out',
                            showMobileMenu
                              ? 'top-full opacity-100'
                              : 'pointer-events-none top-12 opacity-0 lg:pointer-events-auto lg:opacity-100',
                            {
                              'lg:bg-transparent lg:text-white':
                                theme === 'dark' ||
                                (theme === 'transparent' && isOnTop),
                              'lg:bg-transparent lg:text-black':
                                theme === 'default' ||
                                (theme === 'transparent' && !isOnTop),
                            },
                          )}
                        >
                          <>
                            <NavLink
                              rightIcon={
                                <>
                                  <ChevronRight className="lg:hidden" />
                                  <ChevronDown className="ml-2 hidden w-4 lg:inline-block" />
                                </>
                              }
                              outerContent={
                                showCatalogMenu ? (
                                  <CatalogMenu
                                    show={showCatalogMenu}
                                    onClose={() => setShowCatalogMenu(false)}
                                    menuItemRef={catalogMenuItemRef}
                                    showMobileMenu={showMobileMenu}
                                  />
                                ) : null
                              }
                              onClick={() => toggleCatalogMenu()}
                              ref={catalogMenuItemRef}
                            >
                              {t('navbar.catalog')}
                            </NavLink>
                            <NavLink href={WEB_PATHS.EVENT_CALENDAR}>
                              {t('navbar.events')}
                            </NavLink>
                            <NavLink href={WEB_PATHS.LEARNING_TRACK}>
                              {t('navbar.learningTrack')}
                            </NavLink>
                          </>
                          <div className="hidden lg:mr-3 lg:flex lg:flex-1 lg:justify-end">
                            <SearchBar {...searchBarProps} />
                          </div>
                          <Link href={WEB_PATHS.DASHBOARD}>
                            <a
                              className={cx(
                                'hidden h-9 flex-none rounded-lg border px-6 lg:flex lg:items-center',
                                {
                                  'border-white text-white hover:bg-white hover:text-black':
                                    theme === 'dark' ||
                                    (theme === 'transparent' && isOnTop),
                                  'border-gray-300 bg-gray-100 text-black hover:bg-white':
                                    theme === 'default' ||
                                    (theme === 'transparent' && !isOnTop),
                                },
                              )}
                            >
                              {t('navbar.myDashboard')}
                            </a>
                          </Link>
                          <div className="relative hidden px-8 lg:block">
                            <div
                              className={cx('rounded-full p-1', {
                                'bg-gray-200':
                                  theme === 'default' && showNotificationMenu,
                                'hover:bg-gray-200': theme === 'default',
                                'bg-maroon-600':
                                  theme === 'transparent' &&
                                  showNotificationMenu,
                                'hover:bg-maroon-600': theme === 'transparent',
                                'bg-gray-650':
                                  theme === 'dark' && showNotificationMenu,
                                'hover:bg-gray-650': theme === 'dark',
                              })}
                            >
                              <OutlineBell
                                className={cx(
                                  'block cursor-pointer text-heading',
                                  {
                                    'text-white':
                                      theme === 'dark' ||
                                      (theme === 'transparent' && isOnTop),
                                    'text-black':
                                      theme === 'default' ||
                                      (theme === 'transparent' && !isOnTop),
                                  },
                                )}
                                onClick={handleClickNotificationBubble}
                              />
                              <NotificationMenu
                                handleClickNotificationBubble={
                                  handleClickNotificationBubble
                                }
                                isOnTop={isOnTop}
                                showNotificationMenu={showNotificationMenu}
                              />
                            </div>
                          </div>
                          <UserMenu
                            handleClickProfilePicture={
                              handleClickProfilePicture
                            }
                            isOnTop={isOnTop}
                            showUserMenu={showUserMenu}
                            theme={theme}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <Backdrop
        show={showMobileMenu}
        onClick={() => setShowMobileMenu(false)}
      />
    </>,
  );
};

export default MainNavBar;
