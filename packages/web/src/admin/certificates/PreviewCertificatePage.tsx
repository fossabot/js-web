import { PDFViewer } from '@react-pdf/renderer';
import { format } from 'date-fns';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AccessControl } from '../../app-state/accessControl';
import { useAuthInfo } from '../../app-state/useAuthInfo';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import { centralHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import {
  CertificationOrientation,
  ICertificate,
} from '../../models/certificate';
import Button from '../../ui-kit/Button';
import { DocumentPreview } from '../../ui-kit/DocumentPreview';
import { ArrowLeft } from '../../ui-kit/icons';
import InputSection from '../../ui-kit/InputSection';
import { captureError } from '../../utils/error-routing';
import { getCertificateTemplateUrl } from './certificate.utils';

export const PreviewCertificatePage = () => {
  const { context } = useAuthInfo();
  const {
    token: { user },
  } = context;
  const { t } = useTranslation();
  const [templateUrl, setTemplateUrl] = useState<string | null>(null);

  // set defaults for preview state
  const [name, setName] = useState(
    `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Name',
  );
  const [certificate, setCertificate] = useState<ICertificate | undefined>();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());

  const [previewState, setPreviewState] = useState({
    name,
    title,
    date,
  });
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      const { data: cert } = await centralHttp.get<
        BaseResponseDto<ICertificate>
      >(API_PATHS.CERTIFICATES_ID.replace(':id', id as string));

      setCertificate(cert.data);
      getCertificateTemplateUrl(cert.data).then(setTemplateUrl);
      setTitle(cert.data.title);
    };

    const { id } = router.query;
    initialize().catch(captureError);
  }, []);

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
            {t('headerText')} | {t('previewCertificatePage.title')}
          </title>
        </Head>
        <article className="flex h-full space-x-12">
          <section className="flex-1">
            <div className="mb-4 flex items-center space-x-2">
              <Link href={WEB_PATHS.CERTIFICATE_MANAGEMENT}>
                <a>
                  <ArrowLeft />
                </a>
              </Link>
              <header className="text-heading font-bold">
                {t('previewCertificatePage.title')}
              </header>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setPreviewState({ name, date, title });
              }}
            >
              <InputSection
                name="name"
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <InputSection
                name="certificate-title"
                label="Certificate Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <InputSection
                name="date"
                type="date"
                label="Date given"
                value={format(date, 'yyyy-MM-dd')}
                onChange={(e) => setDate(new Date(e.target.value))}
              />
              <Button
                size="medium"
                variant="primary"
                type="submit"
                onClick={() => {
                  setPreviewState({ name, date, title });
                }}
              >
                {t('previewCertificatePage.apply')}
              </Button>
            </form>
          </section>
          <section style={{ flex: 2 }}>
            <PDFViewer className="h-full w-full">
              {templateUrl !== null && (
                <DocumentPreview
                  {...{
                    name: previewState.name,
                    date: previewState.date,
                    title: previewState.title,
                    orientation:
                      certificate.orientation ===
                      CertificationOrientation.VERTICAL
                        ? 'portrait'
                        : 'landscape',
                    templateUrl,
                  }}
                />
              )}
            </PDFViewer>
          </section>
        </article>
      </AdminLayout>
    </AccessControl>
  );
};
