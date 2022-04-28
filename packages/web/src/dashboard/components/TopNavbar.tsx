import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import cx from 'classnames';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';
import { useRouter } from 'next/router';
import { useAuthInfo } from '../../app-state/useAuthInfo';
import { ChevronDown } from '../../ui-kit/icons';

export interface INavbarItemProps {
  title: string;
  link: string;
  active: boolean;
}

function NavbarItem({ title, link, active }: INavbarItemProps) {
  return (
    <Link href={link}>
      <a
        className={cx('mx-6 my-4 block text-caption md:mx-4', {
          'font-semibold text-brand-primary': active,
          'text-gray-600': !active,
        })}
      >
        {title}
      </a>
    </Link>
  );
}

interface ITopNavbarProps {
  hideOnTop?: boolean;
  scrollOffset?: number;
}

function TopNavbar({ hideOnTop = false, scrollOffset = 500 }: ITopNavbarProps) {
  const { t } = useTranslation();
  const { context } = useAuthInfo();
  const [isScroll, setIsScroll] = useState(false);
  const [isShowMobile, setIsShowMobile] = useState(false);
  const router = useRouter();
  const pathname = router.pathname;

  const menuItems = useMemo(
    () => [
      {
        title: t('dashboardPage.home'),
        link: WEB_PATHS.DASHBOARD,
      },
      {
        title: t('dashboardPage.courses'),
        link: WEB_PATHS.DASHBOARD_COURSES,
      },
      {
        title: t('dashboardPage.learningTracks'),
        link: WEB_PATHS.DASHBOARD_LEARNING_TRACKS,
      },
      {
        title: t('dashboardPage.bookings'),
        link: WEB_PATHS.DASHBOARD_BOOKINGS,
      },
      {
        title: t('dashboardPage.certificate'),
        link: WEB_PATHS.DASHBOARD_CERTIFICATE,
      },
    ],
    [],
  );

  const displayName = useMemo(() => {
    const user = context?.token?.user;
    if (user) {
      return (user.firstName || user.lastName || user.username).trim();
    } else {
      return '';
    }
  }, [context?.token?.user]);

  const currentMenu = useMemo(() => {
    const found = menuItems.find((it) => it.link === pathname);
    return found || menuItems[0];
  }, [pathname, menuItems]);

  const detectScrolling = () => {
    const y = window.scrollY;
    if (!isScroll && y > scrollOffset) {
      setIsScroll(true);
    } else {
      setIsScroll(false);
    }
  };
  useEffect(() => {
    if (hideOnTop) {
      window.addEventListener('scroll', detectScrolling, true);
      return () => {
        window.removeEventListener('scroll', detectScrolling, true);
      };
    }
  }, [hideOnTop]);

  return (
    <div
      className={cx(
        'flex flex-col justify-between border-t border-gray-200 bg-white md:justify-start lg:flex-row lg:items-center lg:border-t-0 lg:border-b lg:px-6',
        {
          'lg:hidden': hideOnTop && !isScroll,
        },
      )}
    >
      <div className="my-4 hidden text-body font-semibold text-black lg:mx-8 lg:block">
        {!!displayName
          ? t('dashboardPage.nameDashboard', { name: displayName })
          : t('dashboardPage.myDashboard')}
      </div>
      <div className="my-4 hidden flex-none border-r border-black lg:block" />
      <div
        className="flex w-full cursor-pointer items-center justify-between border-b border-gray-200 px-6 py-4 text-body font-semibold lg:hidden"
        onClick={() => setIsShowMobile(!isShowMobile)}
      >
        <div className="mr-1">{currentMenu.title}</div>
        <ChevronDown className="w-6" />
      </div>
      <div
        className={cx(
          'flex-1 flex-col justify-center border-b border-gray-200 lg:flex-row lg:justify-start lg:border-b-0',
          {
            'hidden lg:flex': !isShowMobile,
          },
        )}
      >
        {menuItems.map((menu, index) => (
          <NavbarItem
            key={index}
            title={menu.title}
            link={menu.link}
            active={menu.link === currentMenu.link}
          />
        ))}
      </div>
    </div>
  );
}

export default TopNavbar;
