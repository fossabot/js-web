import React from 'react';
import Link from 'next/link';
import cx from 'classnames';
import { logout } from '../app-state/auth';
import { ITokenProps } from '../models/auth';
import DropdownMenu from './DropdownMenu';
import WEB_PATHS from '../constants/webPaths';
import { useAuthInfo } from '../app-state/useAuthInfo';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';

interface INavLinkProps {
  href: string;
  linkClassNames?: string;
}
const NavLinks: React.FunctionComponent<INavLinkProps> = ({
  children,
  href,
  linkClassNames,
}) => (
  <Link href={href}>
    <a className={cx('flex-auto px-3 text-black', linkClassNames)}>
      {children}
    </a>
  </Link>
);

interface IHeaderProps {
  title?: string;
  token?: ITokenProps;
}
const Header: React.FunctionComponent<IHeaderProps> = ({ title, token }) => {
  const adminMenu = [
    {
      title: 'User Management',
      href: WEB_PATHS.ADMIN_USER_MANAGEMENT,
    },
    {
      title: 'Invitations',
      href: WEB_PATHS.ADMIN_USER_MANAGEMENT_INVITATION,
    },
    {
      title: 'Group Management',
      href: WEB_PATHS.ADMIN_GROUP_MANAGEMENT,
    },
    {
      title: 'User Upload',
      href: WEB_PATHS.ADMIN_USER_UPLOAD_HISTORY,
    },
    {
      title: 'Login Setting',
      href: WEB_PATHS.ADMIN_LOGIN_SETTING,
    },
    {
      title: 'Password Setting',
      href: WEB_PATHS.ADMIN_PASSWORD_SETTING,
    },
    {
      title: 'Organization Management',
      href: WEB_PATHS.ORGANIZATION_MANAGEMENT,
    },
    {
      title: 'Linked plans',
      href: WEB_PATHS.LINKED_PLANS_PAGE,
    },
    {
      title: 'Payment Dashboard',
      href: WEB_PATHS.PAYMENT_DASHBOARD_PAGE,
    },
  ];

  const handleLogoutClick = async (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault();
    await logout();
  };

  const isAuthenticated = () => {
    return Boolean(token);
  };
  const { canAccess, isLoading } = useAuthInfo();

  return (
    <header className="bg-white py-5 px-6 text-center text-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex flex-shrink-0 items-center text-white">
          <span className="text-xl font-semibold tracking-tight text-brand-primary">
            <Link href="/">
              <a>{title}</a>
            </Link>
          </span>
        </div>
        {isLoading ? (
          <></>
        ) : (
          <div className="flex items-center">
            {isAuthenticated() ? (
              <>
                <NavLinks href={WEB_PATHS.DASHBOARD}>Dashboard</NavLinks>
                <NavLinks href={WEB_PATHS.MY_SUBSCRIPTIONS}>
                  My Subscriptions
                </NavLinks>
                <NavLinks href={WEB_PATHS.PLANS}>Plans</NavLinks>
                {canAccess(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL) && (
                  <DropdownMenu
                    linkClassNames="flex-auto"
                    title="Admin Panel"
                    menuList={adminMenu}
                  ></DropdownMenu>
                )}
                <a
                  onClick={handleLogoutClick}
                  className="b ml-4 flex-auto text-black"
                  href="/login"
                >
                  Logout
                </a>
              </>
            ) : (
              <>
                <NavLinks href="/login">Sign in</NavLinks>
                <NavLinks
                  linkClassNames="rounded bg-brand-tertiary text-white px-2 py-1"
                  href={WEB_PATHS.SIGN_UP}
                >
                  Get Started
                </NavLinks>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
