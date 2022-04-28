import React from 'react';
import Link from 'next/link';
import cx from 'classnames';
import HeaderContainer from './HeaderContainer';
import { logout } from '../../app-state/auth';
import { ITokenProps } from '../../models/auth';
import DropdownMenu from '../DropdownMenu';
import WEB_PATHS from '../../constants/webPaths';
import { useAuthInfo } from '../../app-state/useAuthInfo';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import { Menu, Search } from '../icons';

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
  token?: ITokenProps;
}
const DefaultHeader = ({ token }: IHeaderProps) => {
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
    <HeaderContainer>
      {isLoading ? (
        <></>
      ) : (
        <div className="flex items-center">
          {isAuthenticated() ? (
            <>
              <div className="flex items-center lg:hidden">
                <Search className="mr-4 h-6 w-6" />
                <Menu className="h-6 w-6" />
              </div>
              <div className="hidden lg:block">
                <NavLinks href={WEB_PATHS.DASHBOARD}>Dashboard</NavLinks>
                <NavLinks href={WEB_PATHS.MY_PACKAGES}>
                  My Subscriptions
                </NavLinks>
                <NavLinks href={WEB_PATHS.PLANS}>Plans</NavLinks>
                {canAccess(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL) && (
                  <DropdownMenu
                    linkClassNames="flex-auto"
                    title="Admin Panel"
                    menuList={adminMenu}
                  />
                )}
                <a
                  onClick={handleLogoutClick}
                  className="b ml-4 flex-auto text-black"
                  href="/login"
                >
                  Logout
                </a>
              </div>
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
    </HeaderContainer>
  );
};

export default DefaultHeader;
