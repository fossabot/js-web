import React from 'react';
import Link from 'next/link';
import cx from 'classnames';
import ChevronRight from './icons/ChevronRight';
import ChevronDown from './icons/ChevronDown';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import { useAuthInfo } from '../app-state/useAuthInfo';

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
    <a>
      <div
        className={cx(
          'cursor-pointer whitespace-nowrap p-2 text-black hover:bg-gray-200',
          linkClassNames,
        )}
      >
        {children}
      </div>
    </a>
  </Link>
);

interface IMenu {
  title?: string;
  href?: string;
  permission?: BACKEND_ADMIN_CONTROL;
}

interface IDropdownMenu {
  title?: string;
  menuList?: IMenu[];
  linkClassNames?: string;
}

const DropdownMenu: React.FunctionComponent<IDropdownMenu> = ({
  title,
  menuList,
  linkClassNames,
}) => {
  const { canAccess } = useAuthInfo();

  const renderMenu = () => {
    if (menuList.length <= 0) return null;
    return (
      <>
        {menuList.map((menu: IMenu) => {
          if (menu.permission && !canAccess(menu.permission)) return null;

          return (
            <NavLinks href={menu.href} key={menu.title}>
              {menu.title}
            </NavLinks>
          );
        })}
      </>
    );
  };

  return (
    <div
      className={cx(
        'group relative inline-block w-full lg:w-auto',
        linkClassNames,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="cursor-pointer">{title}</span>
        <ChevronRight className="lg:hidden" />
        <ChevronDown className="ml-2 hidden w-4 hover:block lg:inline-block" />
      </div>
      <div className="absolute left-0 z-30 hidden w-full border border-gray-300 bg-white text-left shadow-sm group-hover:block lg:-left-5 lg:w-auto">
        {renderMenu()}
      </div>
    </div>
  );
};

export default DropdownMenu;
