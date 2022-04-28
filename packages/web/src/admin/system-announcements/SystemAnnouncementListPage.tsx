import { NextPage } from 'next';
import Head from 'next/head';
import { AccessControl } from '../../app-state/accessControl';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import useList from '../../hooks/useList';
import { notificationHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { ITokenProps } from '../../models/auth';
import { ISystemAnnouncement } from '../../models/systemAnnouncement';
import Button from '../../ui-kit/Button';
import { Mail, Plus, Warning } from '../../ui-kit/icons';
import { captureError } from '../../utils/error-routing';
import { SystemAnnouncementList } from './SystemAnnouncementList';
import Picture from '../../ui-kit/Picture';
import { useModal } from '../../ui-kit/HeadlessModal';
import ConfirmationModal from '../../ui-kit/ConfirmationModal';
import { useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { toastMessage } from '../../ui-kit/ToastMessage';
import { SystemAnnouncementModal } from '../../system-announcement/SystemAnnouncementModal';
import { useRouter } from 'next/router';
import PaginationIndicator from '../../shared/PaginationIndicator';

export const SystemAnnouncementListPage: NextPage<ITokenProps> = () => {
  const { t } = useTranslation();
  const { isOpen, toggle } = useModal();
  const { addToast } = useToasts();
  const { locales } = useRouter();
  const { isOpen: isPreview, toggle: togglePreview } = useModal();
  const [localeIdx, setLocaleIdx] = useState(0);
  const [targetAnnouncement, setTargetAnnouncement] =
    useState<ISystemAnnouncement | null>(null);

  const {
    data: announcements,
    fetchData,
    totalPages,
    count,
  } = useList<ISystemAnnouncement>((options) => {
    return notificationHttp.get(API_PATHS.SYSTEM_ANNOUNCEMENT, {
      params: options,
    });
  });

  const handleActiveChange = async (id: string, isActive: boolean) => {
    try {
      await notificationHttp.patch(
        API_PATHS.UPDATE_SYSTEM_ANNOUNCEMENT_STATUS.replace(':id', id),
        { isActive },
      );
    } catch (e) {
      console.error(e);
      captureError(e);
      addToast(
        toastMessage({
          icon: <Warning className="h-5 w-5" />,
          title: e?.response?.data?.message || 'Something went wrong',
        }),
        { appearance: 'error' },
      );
    } finally {
      fetchData();
    }
  };

  const handleBeforeDelete = async (announcement: ISystemAnnouncement) => {
    setTargetAnnouncement(announcement);
    toggle(true);
  };

  const handlePreview = async (announcement: ISystemAnnouncement) => {
    setTargetAnnouncement(announcement);
    togglePreview(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetAnnouncement) return;

    try {
      await notificationHttp.delete(
        API_PATHS.SYSTEM_ANNOUNCEMENT_ID.replace(':id', targetAnnouncement.id),
      );

      toggle(false);
      addToast(
        toastMessage({
          icon: <Mail className="h-5 w-5 text-gray-650" />,
          title: (
            <>
              <span className="font-bold text-brand-primary">{`${targetAnnouncement?.title?.nameEn} / ${targetAnnouncement?.title?.nameTh} `}</span>
              {t('systemAnnouncementListPage.deletedPostfix')}
            </>
          ),
        }),
        { appearance: 'info' },
      );
    } catch (e) {
      console.error(e);
      captureError(e);
      addToast(
        toastMessage({
          icon: <Warning className="h-5 w-5" />,
          title: e?.response?.data?.message || 'Something went wrong',
        }),
        { appearance: 'error' },
      );
    } finally {
      fetchData();
      setTargetAnnouncement(null);
    }
  };

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_SYSTEM_ANNOUNCEMENT_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>
            {t('headerText')} | {t('systemAnnouncementListPage.header')}
          </title>
        </Head>
        <div className="mt-1 flex w-full flex-row justify-between">
          <p className="text-subtitle font-semibold">
            {t('systemAnnouncementListPage.header')}
          </p>
          <Button
            variant="primary"
            size="medium"
            iconLeft={<Plus className="h-5 w-5" />}
            iconWrapperClassName="mr-2"
            avoidFullWidth
            link={WEB_PATHS.SYSTEM_ANNOUNCEMENT_CREATE}
          >
            {t('systemAnnouncementListPage.create')}
          </Button>
        </div>
        {announcements && announcements.length > 0 ? (
          <>
            <SystemAnnouncementList
              systemAnnouncements={announcements}
              onStatusChange={handleActiveChange}
              onClickDelete={handleBeforeDelete}
              onClickPreview={handlePreview}
            />
            <PaginationIndicator
              defaultPerPage={15}
              totalPages={totalPages}
              totalRecords={count}
              resultLength={announcements.length}
              showPageSizeDropDown={false}
            />
          </>
        ) : (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
              <Picture
                className="w-72"
                sources={[
                  {
                    srcSet: '/assets/admin-notification-empty.webp',
                    type: 'image/webp',
                  },
                ]}
                fallbackImage={{
                  src: '/assets/admin-notification-empty.png',
                }}
              />
              <div className="mt-8 text-center font-semibold">
                {t('systemAnnouncementListPage.noAnnouncement')}
              </div>
            </div>
          </>
        )}
        <ConfirmationModal
          modalClassName="w-136"
          avoidFullWidth
          body={
            <>
              <p className="text-red-200">
                {t('systemAnnouncementListPage.deleteWarning')}
              </p>
              <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-100 p-4 text-caption text-black">
                <span className="font-bold">
                  {t('systemAnnouncementListPage.title')}:{' '}
                </span>
                {`${targetAnnouncement?.title?.nameEn} / ${targetAnnouncement?.title?.nameTh}`}
              </div>
            </>
          }
          header={t('systemAnnouncementListPage.deleteModalHeading')}
          onOk={handleConfirmDelete}
          isOpen={isOpen}
          toggle={toggle}
          confirmBtnProps={{
            variant: 'primary',
            type: 'button',
            size: 'medium',
            children: null,
            avoidFullWidth: true,
          }}
          cancelBtnProps={{
            variant: 'secondary',
            type: 'button',
            size: 'medium',
            children: null,
            avoidFullWidth: true,
          }}
          confirmBtnInner={
            <p className="font-semibold text-white">
              {t('systemAnnouncementListPage.remove')}
            </p>
          }
          cancelBtnInner={
            <p className="font-semibold text-black">
              {t('systemAnnouncementListPage.close')}
            </p>
          }
        />
        <SystemAnnouncementModal
          data={isPreview ? targetAnnouncement : null}
          onClose={() => {
            if (localeIdx < locales.length - 1) setLocaleIdx(localeIdx + 1);
            else {
              togglePreview(false);
              // Avoid text immediately changes during modal closing
              setTimeout(() => setLocaleIdx(0), 500);
            }
          }}
          locale={locales[localeIdx]}
        />
      </AdminLayout>
    </AccessControl>
  );
};
