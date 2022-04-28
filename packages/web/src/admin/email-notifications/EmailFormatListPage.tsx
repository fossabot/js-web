import { NextPage } from 'next';
import Head from 'next/head';
import { AccessControl } from '../../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { ITokenProps } from '../../models/auth';
import { AdminBack } from '../../ui-kit/AdminBack';
import Button from '../../ui-kit/Button';
import { Plus } from '../../ui-kit/icons';
import { EmailFormatModal } from './EmailFormatModal';
import { EmailFormatList } from './EmailFormatList';
import { useEmailFormatListPage } from './useEmailFormatListPage';
import { useEffect } from 'react';
import { EmailFormatFormSchema } from './emailFormatForm.schema';
import ConfirmationModal from '../../ui-kit/ConfirmationModal';

export const EmailFormatListPage: NextPage<ITokenProps> = () => {
  const { t } = useTranslation();
  const {
    previewEmailFormat,
    handleSubmitEmailFormat,
    emailFormatModalCreate,
    emailFormats,
    emailFormatModalEdit,
    handleEditEmailFormat,
    handleSubmitEditEmailFormat,
    item2edit,
    emailFormatModalRemove,
    handleConfirmRemoveEmailFormat,
    handleRemoveEmailFormat,
  } = useEmailFormatListPage();

  useEffect(() => {
    emailFormats.fetchData();
  }, []);
  const editingItem = emailFormats.data.find(
    (item) => item.id === item2edit?.id,
  );

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>
            {t('headerText')} | {t('emailFormatListPage.emailFormatList')}
          </title>
        </Head>
        <AdminBack path={WEB_PATHS.EMAIL_NOTIFICATIONS} />
        <header className="mt-8 flex justify-between">
          <div className="text-subtitle font-semibold">
            {t('emailFormatListPage.emailFormat')}
          </div>
          <Button
            variant="primary"
            avoidFullWidth
            className="h-11 space-x-2 py-2 px-5 font-semibold"
            onClick={emailFormatModalCreate.toggle}
          >
            <Plus />
            <div>{t('emailFormatListPage.create')}</div>
          </Button>
        </header>
        <div className="mt-6" />
        {emailFormats.data.length > 0 ? (
          <EmailFormatList
            emailFormats={emailFormats.data}
            onEdit={handleEditEmailFormat}
            onRemove={handleRemoveEmailFormat}
          />
        ) : (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            <img src="/assets/empty-letter.png" className="mx-auto w-40" />
            <div className="mt-8 text-center font-semibold">
              {t('emailFormatListPage.noEmailFormatAvailable')}
            </div>
          </div>
        )}
        <EmailFormatModal
          isOpen={emailFormatModalCreate.isOpen}
          onSubmit={handleSubmitEmailFormat}
          onPreview={previewEmailFormat}
          toggle={emailFormatModalCreate.toggle}
        />
        <EmailFormatModal
          isOpen={emailFormatModalEdit.isOpen}
          onSubmit={handleSubmitEditEmailFormat}
          onPreview={previewEmailFormat}
          toggle={emailFormatModalEdit.toggle}
          initialValues={
            {
              formatName: editingItem?.formatName || '',
              teamName: editingItem?.teamName || '',
              headerImage: editingItem?.headerImageKey || '',
              footerImage: editingItem?.footerImageKey || '',
              footerHTML: editingItem?.footerHTML || '',
              copyrightText: editingItem?.copyrightText || '',
              isDefault: editingItem?.isDefault || false,
            } as EmailFormatFormSchema
          }
        />
        <ConfirmationModal
          isOpen={emailFormatModalRemove.isOpen}
          toggle={emailFormatModalRemove.toggle}
          onOk={handleConfirmRemoveEmailFormat}
          header={t('emailFormatListPage.removeThisFormat')}
          confirmBtnInner={t('emailFormatListPage.removeFormat')}
          confirmBtnProps={{
            className: 'whitespace-nowrap',
            variant: 'primary',
            children: null,
          }}
          logoBodyPadding={false}
          cancelBtnInner={t('emailFormatListPage.close')}
          body={
            <>
              <span className="text-red-200">
                {t('emailFormatListPage.thisActionCannotBeUndone')}
              </span>
              <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-100 p-4">
                <div className="flex min-w-max space-x-1 text-caption">
                  <span className="font-semibold">
                    {t('emailFormatListPage.formatName')}
                  </span>
                  <span>{item2edit?.formatName}</span>
                </div>
              </div>
            </>
          }
        />
      </AdminLayout>
    </AccessControl>
  );
};
