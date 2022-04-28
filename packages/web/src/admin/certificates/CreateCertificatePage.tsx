import { Formik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AccessControl } from '../../app-state/accessControl';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import { centralHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import { CertificationOrientation } from '../../models/certificate';
import Button from '../../ui-kit/Button';
import { getCertificatePayload, uploadToS3 } from './certificate.utils';
import { CreateCertificateForm } from './CreateCertificateForm';
import {
  createCertificateFormSchema,
  ICreateCertificateForm,
} from './createCertificateForm.schema';

export const CreateCertificatePage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleFormSubmit = async ({
    file,
    ...values
  }: ICreateCertificateForm) => {
    try {
      const payload = await getCertificatePayload({ ...values, file });
      const res = await centralHttp.post<
        BaseResponseDto<{
          s3Params: { fields: Record<string, any>; url: string };
        }>
      >(API_PATHS.CERTIFICATES, payload);
      const {
        data: { s3Params },
      } = res.data;

      await uploadToS3(s3Params, file);

      router.push(WEB_PATHS.CERTIFICATE_MANAGEMENT);
    } catch (err) {
      console.error(err);
    }
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
            {t('headerText')} | {t('createCertificatePage.title')}
          </title>
        </Head>
        <article className="mx-auto w-1/4">
          <header className="mb-4 text-heading font-bold">
            {t('createCertificatePage.title')}
          </header>
          <Formik<ICreateCertificateForm>
            initialValues={{
              title: '',
              file: null,
              orientation: CertificationOrientation.VERTICAL,
              certType: null,
              provider: '',
            }}
            onSubmit={handleFormSubmit}
            validationSchema={createCertificateFormSchema}
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
                  {t('certificateForm.create')}
                </Button>
              </form>
            )}
          </Formik>
        </article>
      </AdminLayout>
    </AccessControl>
  );
};
