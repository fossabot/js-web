import { ProfilePic } from '../ProfilePic';
import { IHeaderProps } from './MainNavbar';
import cx from 'classnames';
import WEB_PATHS from '../../constants/webPaths';
import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import useTranslation from '../../i18n/useTranslation';
import { logout } from '../../app-state/auth';
import { useAuthInfo } from '../../app-state/useAuthInfo';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import { useRouter } from 'next/router';
import LanguageSwitcher from './LanguageSwitcher';

interface IUserMenuProps {
  showUserMenu: boolean;
  handleClickProfilePicture: () => void;
  theme?: IHeaderProps['theme'];
  isOnTop?: boolean;
}

export const UserMenu = ({
  showUserMenu,
  handleClickProfilePicture,
  theme = 'default',
  isOnTop = false,
}: IUserMenuProps) => {
  const { pathname } = useRouter();
  const { t } = useTranslation();
  const { canAccess, context } = useAuthInfo();
  const signedInUser = useMemo(() => context?.token?.user, [context]);

  const handleLogoutClick = useCallback(async () => {
    await logout();
  }, []);

  const userMenu = useMemo(() => {
    const menu = [
      {
        title: t('navbar.myAccount'),
        link: WEB_PATHS.MY_PACKAGES,
        onClick: null,
      },
      {
        title: <LanguageSwitcher />,
        link: null,
        onClick: null,
      },
      {
        title: t('navbar.helpCenter'),
        link: WEB_PATHS.HELP_CENTER,
        openNewWindow: true,
        onClick: null,
      },
      {
        title: t('navbar.logout'),
        link: WEB_PATHS.LOGIN,
        onClick: handleLogoutClick,
      },
    ];

    if (canAccess(BACKEND_ADMIN_CONTROL.ACCESS_CLASS_ATTENDANCE)) {
      menu.unshift({
        title: t('navbar.courseAttendance'),
        link: WEB_PATHS.COURSE_ATTENDANCE,
        onClick: null,
      });
    }

    if (
      canAccess(
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_CATALOG_MENU_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_GROUP_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_USER_INVATATION_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_WAY_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_LINKED_PLANS,
        BACKEND_ADMIN_CONTROL.ACCESS_LOGIN_SETTINGS,
        BACKEND_ADMIN_CONTROL.ACCESS_MATERIAL_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_PASSWORD_SETTINGS,
        BACKEND_ADMIN_CONTROL.ACCESS_PAYMENT_DASHBOARD,
        BACKEND_ADMIN_CONTROL.ACCESS_PLAN_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_TAG_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_TOPIC_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_USER_UPLOAD,
        BACKEND_ADMIN_CONTROL.ACCESS_VIDEO_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_ALL_CLASS_ATTENDANCE,
        BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS,
      )
    ) {
      menu.unshift({
        title: t('navbar.adminPanel'),
        link: WEB_PATHS.ADMIN,
        onClick: null,
      });
    }

    return menu;
  }, [canAccess, handleLogoutClick, t]);

  return (
    <>
      <div className="hidden lg:block">
        <div
          onClick={handleClickProfilePicture}
          className={cx('block cursor-pointer p-4 lg:px-0 lg:py-0', {
            'text-white':
              theme === 'dark' || (theme === 'transparent' && isOnTop),
            'text-gray-400':
              theme === 'default' || (theme === 'transparent' && !isOnTop),
          })}
        >
          <ProfilePic
            className="h-8 w-8"
            imageKey={signedInUser?.profileImageKey}
          />
        </div>
      </div>
      <div
        className={cx(
          'w-full bg-white pt-3.5 lg:absolute lg:top-full lg:right-8 lg:w-auto lg:shadow-lg',
          !showUserMenu && 'lg:hidden',
        )}
      >
        <div className="border-b border-[#F3F4F6] px-4 py-3 text-caption font-regular">
          <div>
            <div className="mb-1 text-body font-semibold text-black">
              {signedInUser?.firstName} {signedInUser?.lastName}
            </div>
            <div className="mb-1 text-gray-500">{signedInUser?.email}</div>
          </div>
        </div>

        <div className="text-caption font-regular text-gray-600">
          {userMenu.map((menu, index) =>
            menu.link ? (
              <Link key={index} href={menu.link}>
                <a
                  onClick={menu.onClick}
                  target={menu.openNewWindow === true ? '_blank' : '_self'}
                  rel={menu.openNewWindow === true ? 'noopener noreferrer' : ''}
                  className={cx(
                    'block border-t border-gray-100 p-4 transition-colors hover:bg-red-100',
                    menu.link === pathname &&
                      'font-semibold text-brand-primary',
                  )}
                >
                  {menu.title}
                </a>
              </Link>
            ) : (
              <div
                onClick={menu.onClick}
                className={cx(
                  'block border-t border-gray-100 p-4 transition-colors hover:bg-red-100',
                  menu.link === pathname && 'font-semibold text-brand-primary',
                )}
                key={index}
              >
                {menu.title}
              </div>
            ),
          )}
        </div>
      </div>
    </>
  );
};
