import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';
import Picture from '../Picture';
import { SidebarMenu, SidebarMenuItem } from './SidebarMenu';
import { Account, Company, Gear, Locked, Package, Person } from '../icons';
import { useMemo } from 'react';

export default function UserSidebar() {
  const { t } = useTranslation();

  const menu = useMemo(() => {
    const sidebarMenu: SidebarMenuItem[] = [
      {
        title: t('userSidebar.myPackages'),
        path: WEB_PATHS.MY_PACKAGES,
        icon: Package,
      },
      {
        title: t('userSidebar.editProfile'),
        path: WEB_PATHS.EDIT_PROFILE,
        icon: Person,
      },
      {
        title: t('userSidebar.manageAddress'),
        path: WEB_PATHS.MANAGE_ADDRESS,
        icon: Company,
      },
    ];

    if (process.env.NEXT_PUBLIC_HIDE_V2_FEATURE !== String('true')) {
      sidebarMenu.push({
        title: t('userSidebar.changePassword'),
        path: WEB_PATHS.CHANGE_PASSWORD,
        icon: Locked,
      });
      sidebarMenu.push({
        title: t('userSidebar.purchaseHistory'),
        path: WEB_PATHS.PURCHASE_HISTORY,
        icon: Account,
      });
      sidebarMenu.push({
        title: t('userSidebar.accountSettings'),
        path: WEB_PATHS.ACCOUNT_SETTING,
        icon: Gear,
      });
    }
    return sidebarMenu;
  }, []);

  return (
    <>
      <div className="sticky top-16 z-40 flex w-full flex-col items-center justify-between">
        <SidebarMenu menu={menu} />
      </div>

      <div className="-ml-14 hidden lg:block">
        <Picture
          sources={[
            {
              srcSet: '/assets/account-illustration.webp',
              type: 'image/webp',
            },
          ]}
          fallbackImage={{ src: '/assets/account-illustration.png' }}
        />
      </div>
    </>
  );
}
