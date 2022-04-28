import Link from 'next/link';
import { useState } from 'react';
import WEB_PATHS from '../constants/webPaths';
import { UserMenu } from '../ui-kit/headers/UserMenu';
import { ArrowRepeat, Logo } from '../ui-kit/icons';

export const AdminHeader = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 box-content flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
      <div className="flex items-center space-x-7">
        <Link href={WEB_PATHS.DASHBOARD}>
          <a className="text-brand-primary">
            <Logo />
          </a>
        </Link>
        <span className="text-caption font-semibold">SEAC Admin Panel</span>
      </div>
      <div className="flex items-center space-x-6">
        <Link href={WEB_PATHS.DASHBOARD}>
          <a className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-gray-100 py-2 px-6 font-semibold">
            <ArrowRepeat />
            <span>Back to platform</span>
          </a>
        </Link>
        <UserMenu
          showUserMenu={showUserMenu}
          handleClickProfilePicture={() => setShowUserMenu((_) => !_)}
        />
      </div>
    </header>
  );
};
