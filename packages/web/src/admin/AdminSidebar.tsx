import cx from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment, SVGProps, useEffect, useMemo, useState } from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';
import WEB_PATHS from '../constants/webPaths';
import {
  BellSolid,
  Book,
  CertificateSolid,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Company,
  Document,
  Gear,
  Home,
  LearningTrack,
  Lesson,
  Payment,
  Person,
} from '../ui-kit/icons';
import { convertWebPathToRoute } from '../utils/convertWebPathToRoute';

const { theme } = resolveConfig(tailwindConfig);

type SideMenuItem = {
  icon?: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  label: string;
  path: string;
  subPath?: string[];
};
type SideMenuGroup = {
  icon?: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  label: string;
  children: SideMenuItem[];
};

export const ADMIN_SIDEBAR_WIDTH_COLLAPSED = 60;
export const ADMIN_SIDEBAR_WIDTH_EXPANDED = 300;

const FOOTER_HEIGHT = 48;
const HEADER_HEIGHT = 60;

export const AdminSidebar = () => {
  const router = useRouter();

  const isAdminRoute = router.pathname === WEB_PATHS.ADMIN;
  const [isOpen, setIsOpen] = useState(false);
  const [openSidebarMenuItems, setOpenSidebarMenuItems] = useState<{
    [key: string]: boolean;
  }>({});
  // offset height is used to recalculate the sidebarheight depending on the scroll position,
  // so it won't overlap with the footer
  const [offsetHeight, setOffsetHeight] = useState(0);

  useEffect(() => {
    if (router.pathname === WEB_PATHS.ADMIN) {
      setIsOpen(true);
    }
  }, [router.pathname]);

  const calculateOffsetHeight = (element: Element) => {
    const { scrollHeight, clientHeight, scrollTop } = element;
    const maxScrollTop = scrollHeight - clientHeight;
    if (scrollTop + FOOTER_HEIGHT >= maxScrollTop) {
      setOffsetHeight(Math.ceil(FOOTER_HEIGHT - (maxScrollTop - scrollTop)));
    } else {
      setOffsetHeight(0);
    }
  };

  useEffect(() => {
    const onScroll = (e) => {
      calculateOffsetHeight(e.target.scrollingElement);
    };

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    calculateOffsetHeight(window.document.scrollingElement);
  }, [router.pathname, isOpen]);

  const sidebarMenu = useMemo<(SideMenuGroup | SideMenuItem)[]>(() => {
    return [
      { icon: Home, label: 'Admin Panel', path: WEB_PATHS.ADMIN },
      {
        icon: Person,
        label: 'Users & Group',
        children: [
          {
            label: 'User Management',
            path: WEB_PATHS.ADMIN_USER_MANAGEMENT,
            subPath: [
              WEB_PATHS.ADMIN_ADD_USER,
              WEB_PATHS.ADMIN_USER_PURCHASE_HISTORY,
              WEB_PATHS.ADMIN_USER_PROFILE,
              WEB_PATHS.ADMIN_ROLE_POLICY_MANAGEMENT,
            ],
          },
          { label: 'Group Management', path: WEB_PATHS.ADMIN_GROUP_MANAGEMENT },
          {
            label: 'User Invitations',
            path: WEB_PATHS.ADMIN_USER_MANAGEMENT_INVITATION,
            subPath: [WEB_PATHS.ADMIN_INVITE_USER],
          },
          {
            label: 'User Upload',
            path: WEB_PATHS.ADMIN_USER_UPLOAD_HISTORY,
            subPath: [WEB_PATHS.ADMIN_USER_UPLOAD],
          },
        ],
      },
      {
        icon: Company,
        label: 'Organization',
        path: WEB_PATHS.ORGANIZATION_MANAGEMENT,
        subPath: [
          WEB_PATHS.ORGANIZATION_DETAIL,
          WEB_PATHS.ORGANIZATION_LIST_USER,
          WEB_PATHS.ORGANIZATION_USER_UPLOAD,
          WEB_PATHS.ORGANIZATION_USER_UPLOAD_HISTORY,
        ],
      },
      {
        icon: Book,
        label: 'Session',
        path: WEB_PATHS.SESSION_MANAGEMENT,
        subPath: [
          WEB_PATHS.SESSION_PARTICIPANTS_MANAGEMENT,
          WEB_PATHS.SESSION_CANCELLING_USERS_MANAGEMENT,
          WEB_PATHS.SESSION_MANAGEMENT_CREATE,
          WEB_PATHS.SESSION_MANAGEMENT_EDIT,
          WEB_PATHS.SESSION_MANAGEMENT_BULK_UPLOAD,
          WEB_PATHS.SESSION_MANAGEMENT_BULK_UPLOAD_HISTORY,
        ],
      },
      {
        icon: Lesson,
        label: 'Catalog',
        children: [
          { label: 'Topic Management', path: WEB_PATHS.ADMIN_TOPICS },
          { label: 'Catalog Menu', path: WEB_PATHS.ADMIN_CATALOG_MENU },
          { label: 'Tag Management', path: WEB_PATHS.ADMIN_TAGS },
          { label: 'Learning Ways', path: WEB_PATHS.ADMIN_LEARNING_WAYS },
          {
            label: 'Course Discovery',
            path: WEB_PATHS.COURSE_DISCOVERY_MANAGEMENT,
          },
          {
            label: 'Promo Banner',
            path: WEB_PATHS.ADMIN_PROMO_BANNER,
          },
        ],
      },
      {
        icon: LearningTrack,
        label: 'Learning Track',
        children: [
          {
            label: 'Manage Learning Track',
            path: WEB_PATHS.ADMIN_LEARNING_TRACK,
            subPath: [
              WEB_PATHS.LEARNING_TRACK_CREATE,
              WEB_PATHS.ADMIN_LEARNING_TRACK_DETAIL,
            ],
          },
          {
            label: 'Accessors Permission',
            path: WEB_PATHS.LEARNING_TRACK_MANAGE_ACCESS,
            subPath: [
              WEB_PATHS.LEARNING_TRACK_MANAGE_ACCESS_BULK_UPLOAD,
              WEB_PATHS.LEARNING_TRACK_MANAGE_ACCESS_BULK_UPLOAD_HISTORY,
            ],
          },
          {
            label: 'Learning track assigned',
            path: WEB_PATHS.LEARNING_TRACK_ASSIGNED,
            subPath: [
              WEB_PATHS.LEARNING_TRACK_ASSIGNED_BULK_UPLOAD,
              WEB_PATHS.LEARNING_TRACK_ASSIGNED_BULK_UPLOAD_HISTORY,
            ],
          },
        ],
      },
      {
        icon: Document,
        label: 'Course',
        children: [
          {
            label: 'Manage Course',
            path: WEB_PATHS.COURSE,
            subPath: [WEB_PATHS.COURSE_CREATE, WEB_PATHS.ADMIN_COURSE_DETAIL],
          },
          {
            label: 'Accessors Permission',
            path: WEB_PATHS.COURSE_MANAGE_ACCESS,
            subPath: [
              WEB_PATHS.COURSE_MANAGE_ACCESS_BULK_UPLOAD,
              WEB_PATHS.COURSE_MANAGE_ACCESS_BULK_UPLOAD_HISTORY,
            ],
          },
          {
            label: 'Course required/assigned',
            path: WEB_PATHS.COURSE_REQUIRED_ASSIGNED,
            subPath: [
              WEB_PATHS.COURSE_REQUIRED_ASSIGNED_BULK_UPLOAD,
              WEB_PATHS.COURSE_REQUIRED_ASSIGNED_BULK_UPLOAD_HISTORY,
            ],
          },
          {
            label: 'Manage Rules',
            path: WEB_PATHS.COURSE_RULE,
            subPath: [
              WEB_PATHS.COURSE_RULE_CREATE,
              WEB_PATHS.COURSE_RULE_DETAIL,
            ],
          },
          { label: 'Bundle Outline', path: WEB_PATHS.COURSE_OUTLINE_BUNDLE },
          {
            label: 'Material',
            path: WEB_PATHS.MATERIALS,
            subPath: [WEB_PATHS.MATERIALS_CREATE, WEB_PATHS.MATERIALS_DETAIL],
          },
          {
            label: 'Video',
            path: WEB_PATHS.VIDEO_MANAGEMENT,
            subPath: [
              WEB_PATHS.VIDEO_MANAGEMENT_CREATE,
              WEB_PATHS.VIDEO_MANAGEMENT_DETAIL,
            ],
          },
        ],
      },
      {
        icon: CertificateSolid,
        label: 'Certificate',
        children: [
          {
            label: 'Certificate Management',
            path: WEB_PATHS.CERTIFICATE_MANAGEMENT,
            subPath: [
              WEB_PATHS.CERTIFICATE_MANAGEMENT_PREVIEW,
              WEB_PATHS.CERTIFICATE_MANAGEMENT_CREATE,
              WEB_PATHS.CERTIFICATE_MANAGEMENT_ID,
            ],
          },
          {
            label: 'Manage Unlock Rules',
            path: WEB_PATHS.CERTIFICATE_UNLOCK_RULE,
            subPath: [
              WEB_PATHS.CERTIFICATE_UNLOCK_RULE_CREATE,
              WEB_PATHS.CERTIFICATE_UNLOCK_RULE_DETAIL,
            ],
          },
        ],
      },
      {
        icon: Payment,
        label: 'Plan & Payment',
        children: [
          {
            label: 'Plan Management',
            path: WEB_PATHS.PLAN_MANAGEMENT,
            subPath: [WEB_PATHS.PLAN_MANAGEMENT_DETAIL],
          },
          { label: 'Course Bundle', path: WEB_PATHS.PLAN_COURSE_BUNDLE },
          { label: 'Linked Plan', path: WEB_PATHS.LINKED_PLANS_PAGE },
          {
            label: 'Payment Dashboard',
            path: WEB_PATHS.PAYMENT_DASHBOARD_PAGE,
          },
        ],
      },
      {
        icon: BellSolid,
        label: 'Notification Setting',
        children: [
          { label: 'Push Notifications', path: WEB_PATHS.PUSH_NOTIFICATIONS },
          {
            label: 'Email Notifications',
            path: WEB_PATHS.EMAIL_NOTIFICATIONS,
            subPath: [WEB_PATHS.EMAIL_LOGS],
          },
          {
            label: 'System Announcements',
            path: WEB_PATHS.SYSTEM_ANNOUNCEMENT,
            subPath: [
              WEB_PATHS.SYSTEM_ANNOUNCEMENT_CREATE,
              WEB_PATHS.SYSTEM_ANNOUNCEMENT_ID,
            ],
          },
        ],
      },
      {
        icon: Gear,
        label: 'Platform Setting',
        children: [
          { label: 'Login Setting', path: WEB_PATHS.ADMIN_LOGIN_SETTING },
          { label: 'Password Setting', path: WEB_PATHS.ADMIN_PASSWORD_SETTING },
        ],
      },
    ];
  }, []);

  const [selectedMainItem, selectedSubItem] = useMemo<
    [SideMenuItem | SideMenuGroup | null, SideMenuItem | null]
  >(() => {
    for (const mainItem of sidebarMenu) {
      if ('path' in mainItem) {
        if (mainItem.path === router.pathname) {
          return [mainItem, null];
        }
        if ('subPath' in mainItem) {
          for (const subPath of mainItem.subPath) {
            if (convertWebPathToRoute(subPath) === router.pathname) {
              return [mainItem, null];
            }
          }
        }
      } else {
        for (const subItem of mainItem.children) {
          if (subItem.path === router.pathname) {
            return [mainItem, subItem];
          }
          if ('subPath' in subItem) {
            for (const subPath of subItem.subPath) {
              if (convertWebPathToRoute(subPath) === router.pathname) {
                return [mainItem, subItem];
              }
            }
          }
        }
      }
    }
    return [null, null];
  }, [router.pathname, sidebarMenu]);

  useEffect(() => {
    if (selectedMainItem) {
      setOpenSidebarMenuItems((status) => ({
        ...status,
        [selectedMainItem.label]: true,
      }));
    }
  }, [selectedMainItem]);

  const sidebarToggler = (
    <span
      className="flex cursor-pointer items-center justify-center rounded-full bg-white p-1 shadow-sm"
      onClick={(e) => {
        e.preventDefault();
        setIsOpen((_) => !_);
      }}
    >
      {isOpen ? (
        <ChevronLeft className="h-5 w-5 text-gray-650" />
      ) : (
        <ChevronRight className="h-5 w-5 text-gray-650" />
      )}
    </span>
  );

  return (
    <>
      <aside
        className={cx('fixed left-0 z-40 overflow-y-auto bg-gray-100')}
        style={{
          // + 1 for rounding as the sidebar sometimes cover the footer border
          height: `calc(100vh - ${HEADER_HEIGHT + offsetHeight + 1}px)`,
          width: isOpen
            ? ADMIN_SIDEBAR_WIDTH_EXPANDED
            : ADMIN_SIDEBAR_WIDTH_COLLAPSED,
          top: HEADER_HEIGHT,
        }}
      >
        {!isOpen && (
          <div className="flex items-center justify-center p-4">
            {sidebarToggler}
          </div>
        )}
        {sidebarMenu.map((mainItem) => {
          const isSelectedMainItem = selectedMainItem?.label === mainItem.label;
          const hasPath = 'path' in mainItem;
          const Icon = 'icon' in mainItem ? mainItem.icon : null;
          const isMainItemOpen = !!openSidebarMenuItems[mainItem.label];
          const isMainItemAdminRoute =
            hasPath && mainItem.path == WEB_PATHS.ADMIN;

          return (
            <Fragment key={mainItem.label}>
              <ConditionalLink href={hasPath ? mainItem.path : ''}>
                <a
                  role="button"
                  onClick={() => {
                    if (!hasPath) {
                      setOpenSidebarMenuItems((status) => ({
                        ...status,
                        [mainItem.label]: !isOpen
                          ? true
                          : !status[mainItem.label],
                      }));
                      if (!isOpen) setIsOpen(true);
                    }
                  }}
                  className={cx(
                    'flex items-center justify-between space-x-8 border-l-2 bg-gray-100 p-4 font-semibold',
                    {
                      'border-brand-primary text-brand-primary':
                        isSelectedMainItem,
                      'text-gray-650': !isSelectedMainItem,
                      'sticky top-0 shadow-sm': isMainItemAdminRoute && isOpen,
                      'border-t': !isMainItemAdminRoute || !isOpen,
                    },
                  )}
                  style={{ borderTopColor: theme.colors.gray['200'] }}
                  title={mainItem.label}
                >
                  <div className="flex items-center space-x-4">
                    {Icon && <Icon className="h-5 w-5" />}
                    {isOpen && <span>{mainItem.label}</span>}
                  </div>
                  {!hasPath && isOpen && (
                    <span className="p-1">
                      {isMainItemOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-650" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-650" />
                      )}
                    </span>
                  )}
                  {isOpen && isMainItemAdminRoute && sidebarToggler}
                </a>
              </ConditionalLink>
              {isOpen && isMainItemOpen && 'children' in mainItem && (
                <div className="pb-2">
                  {mainItem.children.map((subItem) => {
                    const isSelectedSubItem =
                      selectedSubItem?.path === subItem?.path;
                    return (
                      <div
                        key={subItem.label}
                        className={cx('block border-l-2 px-4')}
                      >
                        <Link href={subItem.path}>
                          <a
                            className={cx(
                              'block rounded-lg border py-3 pl-9 pr-3 font-semibold hover:bg-gray-200',
                              {
                                'border-gray-200 bg-white text-brand-primary':
                                  isSelectedSubItem,
                                'border-transparent bg-gray-100 text-gray-650':
                                  !isSelectedSubItem,
                              },
                            )}
                          >
                            {subItem.label}
                          </a>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </Fragment>
          );
        })}
      </aside>

      <div
        className="h-full"
        style={{
          width: isAdminRoute
            ? isOpen
              ? ADMIN_SIDEBAR_WIDTH_EXPANDED
              : ADMIN_SIDEBAR_WIDTH_COLLAPSED
            : ADMIN_SIDEBAR_WIDTH_COLLAPSED,
          minWidth: isAdminRoute
            ? isOpen
              ? ADMIN_SIDEBAR_WIDTH_EXPANDED
              : ADMIN_SIDEBAR_WIDTH_COLLAPSED
            : ADMIN_SIDEBAR_WIDTH_COLLAPSED,
        }}
      />

      <div
        className={cx(
          'fixed top-0 left-0 h-full w-full bg-black transition-all',
          {
            'z-30 opacity-25': isOpen && !isAdminRoute,
            '-z-1 opacity-0': !(isOpen && !isAdminRoute),
          },
        )}
        onClick={() => setIsOpen(false)}
      ></div>
    </>
  );
};

const ConditionalLink = ({ href, children }) => {
  if (href) {
    return <Link href={href}>{children}</Link>;
  } else {
    return children;
  }
};
