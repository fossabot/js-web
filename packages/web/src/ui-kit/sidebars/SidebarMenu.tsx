import cx from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { IconType } from 'react-icons/lib';
import Backdrop from '../Backdrop';
import { ChevronDown, Close } from '../icons';

export interface SidebarMenuItem {
  title: string;
  path?: string;
  icon?: IconType;
}

interface ISidebarMenuProps {
  menu: SidebarMenuItem[];
}

export function SidebarMenu({ menu }: ISidebarMenuProps) {
  const { pathname } = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleToggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const currentMenu = menu.find((m) => pathname.includes(m.path));
  const currentMenuItem = currentMenu ? currentMenu : null;
  const mobileMenu = useMemo(
    () => (
      <div
        onClick={handleToggleMobileMenu}
        className="z-30 flex w-full items-center justify-between border-b border-gray-200 bg-white py-5 pl-8 pr-6 font-semibold text-gray-700 lg:hidden"
      >
        <span className="flex items-center">
          {currentMenuItem.icon && (
            <currentMenuItem.icon className="mr-4 h-5 w-5" />
          )}{' '}
          {currentMenu.title}
        </span>
        <div className="relative h-6 w-6">
          <Close
            className={cx(
              'absolute top-0 left-0 h-6 w-6 cursor-pointer transition-opacity duration-300',
              showMobileMenu ? 'opacity-100' : 'opacity-0',
            )}
          />
          <ChevronDown
            className={cx(
              'absolute top-0 left-0 h-6 w-6 cursor-pointer transition-opacity duration-300',
              showMobileMenu ? 'opacity-0' : 'opacity-100',
            )}
          />
        </div>
      </div>
    ),
    [currentMenuItem, showMobileMenu],
  );
  const mobileMenuToggle = currentMenu ? mobileMenu : null;

  const getMenuList = (menu) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMemo(
      () =>
        menu.map((m, index) => {
          return (
            <li
              key={index}
              className={cx(
                'rounded-lg border-gray-200 px-5 py-4 text-body font-semibold transition-all duration-300 hover:bg-gray-200',
                pathname.includes(m.path)
                  ? 'border bg-white text-brand-primary'
                  : 'text-gray-700',
              )}
            >
              <Link href={m.path || '#'}>
                <a className="flex items-center">
                  {m.icon && <m.icon className="mr-4 h-5 w-5" />}
                  <span>{m.title}</span>
                </a>
              </Link>
            </li>
          );
        }),
      [menu],
    );
  };

  return (
    <>
      <div className="relative z-50 w-full">
        {mobileMenuToggle}
        <ul
          className={cx(
            'absolute top-full z-40 w-full bg-gray-100 p-3 transition-all duration-300 ease-in-out lg:static lg:mt-0 lg:pt-3',
            showMobileMenu
              ? 'opacity-100'
              : 'pointer-events-none opacity-0 lg:pointer-events-auto lg:opacity-100',
          )}
        >
          {getMenuList(menu)}
        </ul>
      </div>
      <Backdrop
        show={showMobileMenu}
        onClick={() => setShowMobileMenu(false)}
      />
    </>
  );
}
