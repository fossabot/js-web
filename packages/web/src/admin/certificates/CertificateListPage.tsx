import axios from 'axios';
import fileDownload from 'js-file-download';
import mime from 'mime';
import Head from 'next/head';
import { useRouter } from 'next/router';
import path from 'path';
import { useCallback, useState } from 'react';
import { FaPaperclip } from 'react-icons/fa';
import sanitizeFilename from 'sanitize-filename';
import { AccessControl } from '../../app-state/accessControl';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import useList, { FetchOptions } from '../../hooks/useList';
import { centralHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { ICertificate } from '../../models/certificate';
import Button from '../../ui-kit/Button';
import DropdownButton from '../../ui-kit/DropdownButton';
import { getCertificateTemplateUrl } from './certificate.utils';
import { CertificateList } from './CertificateList';
import { DeleteCertificateModal } from './DeleteCertificateModal';

export const CertificateListPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [deleteCertId, setDeleteCertId] =
    useState<ICertificate['id'] | null>(null);

  const getCertificates = useCallback((options: FetchOptions) => {
    return centralHttp.get(API_PATHS.CERTIFICATES, { params: options });
  }, []);

  const { data, totalPages, fetchData } =
    useList<ICertificate>(getCertificates);

  const onClickAdd = () => {
    router.push(WEB_PATHS.CERTIFICATE_MANAGEMENT_CREATE);
  };

  const onClickEdit = (certificate: ICertificate) => {
    router.push(
      WEB_PATHS.CERTIFICATE_MANAGEMENT_ID.replace(':id', certificate.id),
    );
  };

  const onDeleteAction = (id: ICertificate['id']) => {
    setDeleteCertId(id);
  };

  const handleDeleteCertificate = async () => {
    try {
      if (deleteCertId === null) return;

      await centralHttp.delete(
        API_PATHS.CERTIFICATES_ID.replace(':id', deleteCertId),
      );
      fetchData();
      setDeleteCertId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const onDownloadCertificate = async (certificate: ICertificate) => {
    const extension = mime.getExtension(certificate.mime);
    const data = await getCertificateTemplateUrl(certificate);
    const res = await axios.get(data, { responseType: 'blob' });

    fileDownload(
      res.data,
      `${path.basename(
        sanitizeFilename(certificate.title),
        `.${extension}`,
      )}.${extension}`,
    );
  };

  const onPreviewCertificate = async (certificate: ICertificate) => {
    router.push(
      WEB_PATHS.CERTIFICATE_MANAGEMENT_PREVIEW.replace(':id', certificate.id),
    );
  };

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>
            {t('headerText')} | {t('certificateListPage.title')}
          </title>
        </Head>
        <div className="mx-6 text-right lg:mx-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex w-1/4">
              <h2 className="mb-2 py-2 text-left font-bold text-black">
                {t('certificateListPage.title')}
              </h2>
            </div>
            <div className="flex w-2/5 flex-row items-center justify-end text-right">
              <div className="mx-1 w-1/2">
                <Button
                  type="button"
                  size="medium"
                  variant="primary"
                  className="w-1/2"
                  onClick={onClickAdd}
                >
                  Create
                </Button>
              </div>
              <DropdownButton
                wrapperClassNames={'mx-1 mt-4 lg:mt-0 w-full lg:w-1/2'}
                buttonName={'Actions'}
                menuItems={[
                  {
                    name: 'Manage unlock rules',
                    action: () =>
                      router.push(WEB_PATHS.CERTIFICATE_UNLOCK_RULE),
                    activeIcon: (
                      <FaPaperclip
                        className="mr-2 h-5 w-5 text-yellow-200"
                        aria-hidden="true"
                      />
                    ),
                    inactiveIcon: (
                      <FaPaperclip
                        className="mr-2 h-5 w-5 text-yellow-200"
                        aria-hidden="true"
                      />
                    ),
                  },
                ]}
              />
            </div>
          </div>
          <CertificateList
            {...{
              certificates: data,
              onClickEdit,
              onDeleteAction,
              totalPages,
              onDownloadCertificate,
              onPreviewCertificate,
            }}
          />
        </div>
      </AdminLayout>
      <DeleteCertificateModal
        {...{
          isOpen: deleteCertId !== null,
          toggle: (bool) => {
            if (!bool) {
              setDeleteCertId(null);
            }
          },
          onDelete: handleDeleteCertificate,
        }}
      />
    </AccessControl>
  );
};
