import { Formik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AccessControl } from '../../app-state/accessControl';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import { centralHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import {
  CertificationOrientation,
  CertificationType,
  ICertificate,
} from '../../models/certificate';
import Button from '../../ui-kit/Button';
import { captureError } from '../../utils/error-routing';
import { getCertificatePayload, uploadToS3 } from './certificate.utils';
import { CreateCertificateForm } from './CreateCertificateForm';
import { ICreateCertificateForm } from './createCertificateForm.schema';

export const EditCertificatePage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [certificate, setCertificate] = useState<ICertificate>({
    title: '',
    file: null,
    orientation: CertificationOrientation.HORIZONTAL,
    certType: CertificationType.COURSE,
    provider: '',
  } as any);

  const handleFormSubmit = async (values: ICreateCertificateForm) => {
    const endpoint = API_PATHS.CERTIFICATES_ID.replace(':id', certificate.id);

    const noopFile: File = {
      lastModified: 0,
      name: certificate.filename,
      size: certificate.bytes,
      type: certificate.mime,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      slice: () => null,
      text: () => Promise.resolve(''),
      stream: null,
      webkitRelativePath: null,
    };

    const originalFilePayload = {
      mime: certificate.mime,
      filename: certificate.filename,
      bytes: certificate.bytes,
      hash: certificate.hash,
    };

    if (!values.file) {
      const payload = await getCertificatePayload({
        ...values,
        file: noopFile,
      });
      await centralHttp.put(endpoint, {
        ...payload,
        ...originalFilePayload,
      });
      router.push(WEB_PATHS.CERTIFICATE_MANAGEMENT);
      return;
    }

    const payload = await getCertificatePayload(values);
    const isSameFile = payload.hash === certificate.hash;
    if (isSameFile) {
      await centralHttp.put(endpoint, {
        ...payload,
        ...originalFilePayload,
      });
    } else {
      const response = await centralHttp.put<
        BaseResponseDto<{
          s3Params: { fields: Record<string, any>; url: string };
        }>
      >(endpoint, payload);
      const { s3Params } = response.data.data;
      await uploadToS3(s3Params, values.file);
    }
    router.push(WEB_PATHS.CERTIFICATE_MANAGEMENT);
  };

  useEffect(() => {
    const { id } = router.query;

    centralHttp
      .get<BaseResponseDto<ICertificate>>(
        API_PATHS.CERTIFICATES_ID.replace(':id', id as string),
      )
      .then((res) => {
        setCertificate(res.data.data);
      })
      .catch(captureError);
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
            {t('headerText')} | {t('editCertificatePage.title')}
          </title>
        </Head>
        <article className="mx-auto w-1/4">
          <header className="mb-4 text-heading font-bold">
            {t('editCertificatePage.title')}
          </header>
          <Formik<ICreateCertificateForm>
            initialValues={{
              title: certificate.title,
              file: null,
              orientation: certificate.orientation,
              certType: certificate.certType,
              provider: certificate.provider,
            }}
            onSubmit={handleFormSubmit}
            enableReinitialize={true}
          >
            {(formik) => (
              <form onSubmit={formik.handleSubmit}>
                <CreateCertificateForm />
                <Button
                  variant="primary"
                  type="submit"
                  size="medium"
                  className="mt-8"
                  disabled={formik.isSubmitting}
                >
                  {t('certificateForm.save')}
                </Button>
              </form>
            )}
          </Formik>
        </article>
      </AdminLayout>
    </AccessControl>
  );
};
