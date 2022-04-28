import { useFormik } from 'formik';

import useUpload from './useUpload';
import InputSection from '../ui-kit/InputSection';
import InputCheckbox from '../ui-kit/InputCheckbox';
import { organizationSchema } from './organization.schema';
import OrganizationSSOIDPInfoForm from './OrganizationSSOIDPInfoForm';
import OrganizationSSOSPInfoForm from './OrganizationSSOSPInfoForm';

const OrganizationForm = ({
  organization,
  onAddAction,
}: {
  organization?: any;
  onAddAction: (value: any, params: any) => Promise<void>;
}) => {
  const { saveToState: saveCertificateToState, upload: uploadCertificate } =
    useUpload();
  const { saveToState: saveMetadataToState, upload: uploadIDPMetadata } =
    useUpload();
  const { saveToState: saveSPCertificateToState, upload: uploadSPCertificate } =
    useUpload();
  const { saveToState: saveSPMetadataToState, upload: uploadSPMetadata } =
    useUpload();

  const formik = useFormik({
    initialValues: {
      name: organization?.name || '',
      showOnlySubscribedCourses: !!organization?.showOnlySubscribedCourses,
      disableUpgrade: !!organization?.disableUpgrade,
      idp: {
        issuer: organization?.sso?.idp?.issuer || '',
        ssoLoginUrl: organization?.sso?.idp?.ssoLoginUrl || '',
        nameidFormat: organization?.sso?.idp?.nameidFormat || '',
        metadataFileName: organization?.sso?.idp?.metadataFileName || '',
        certificateFileName: organization?.sso?.idp?.certificateFileName || '',
      },
      sp: {
        spIssuer: organization?.sso?.sp?.issuer || '',
        spAcsUrl: organization?.sso?.sp?.callbackUrl || '',
        spMetadataFileName: organization?.sso?.sp?.metadataFileName || '',
        spCertificateFileName: organization?.sso?.sp?.certificateFileName || '',
      },
      setupOrganizationSSOIDP: !!organization?.isIdentityProvider,
      setupOrganizationSSOSP: !!organization?.isServiceProvider,
    },
    enableReinitialize: true,
    validationSchema: organizationSchema,
    onSubmit: handleFormSubmit,
  });

  async function handleFormSubmit(values) {
    const spData = values.setupOrganizationSSOSP ? values.sp : {};
    const idpData = values.setupOrganizationSSOIDP ? values.idp : {};

    const data = {
      ...values,
      ...spData,
      ...idpData,
      isServiceProvider: values.setupOrganizationSSOSP,
      isIdentityProvider: values.setupOrganizationSSOIDP,
    };
    delete data.sp;
    delete data.idp;

    console.log({ data, values });

    await onAddAction(
      data.setupOrganizationSSOIDP || values.setupOrganizationSSOSP
        ? data
        : {
            name: data.name,
            showOnlySubscribedCourses: data.showOnlySubscribedCourses,
            disableUpgrade: data.disableUpgrade,
          },
      {
        uploadCertificate,
        uploadIDPMetadata,
        uploadSPMetadata,
        uploadSPCertificate,
      },
    );
  }

  return (
    <div>
      <form onSubmit={formik.handleSubmit} autoComplete="off">
        <div className="mb-8">
          <InputSection
            formik={formik}
            name="name"
            label="Organization Name *"
            placeholder=""
            onBlur={formik.handleBlur}
            inputWrapperClassName="mb-3"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && formik.errors.name}
          />
          <InputCheckbox
            formik={formik}
            name="showOnlySubscribedCourses"
            label="Let users only see courses within their subscription plan"
            onBlur={formik.handleBlur}
            inputWrapperClassName="mb-3"
            checked={formik.values.showOnlySubscribedCourses}
            value={formik.values.showOnlySubscribedCourses}
            onChange={() => {
              formik.setFieldValue(
                'showOnlySubscribedCourses',
                !formik.values.showOnlySubscribedCourses,
              );
            }}
          />
          <InputCheckbox
            formik={formik}
            name="disableUpgrade"
            label="Restrict users from purchasing/upgrading/renewing subscriptions plans"
            onBlur={formik.handleBlur}
            inputWrapperClassName="mb-3"
            checked={formik.values.disableUpgrade}
            value={formik.values.disableUpgrade}
            onChange={() => {
              formik.setFieldValue(
                'disableUpgrade',
                !formik.values.disableUpgrade,
              );
            }}
          />
        </div>

        <div>
          <h3 className="mb-3 text-left text-xl">SAML Based SSO</h3>
          <InputCheckbox
            formik={formik}
            name="setupOrganizationSSOIDP"
            label="Setup this organization as Identity Provider"
            onBlur={formik.handleBlur}
            inputWrapperClassName="mb-3"
            checked={formik.values.setupOrganizationSSOIDP}
            value={formik.values.setupOrganizationSSOIDP}
            onChange={() => {
              const curr = formik.values.setupOrganizationSSOIDP;
              formik.setFieldValue('setupOrganizationSSOIDP', !curr);

              if (!curr) {
                formik.setFieldValue('setupOrganizationSSOSP', false);
              }
            }}
          />
          {formik.values.setupOrganizationSSOIDP ? (
            <OrganizationSSOIDPInfoForm
              formik={formik}
              organization={organization}
              saveMetadata={saveMetadataToState}
              saveCertificate={saveCertificateToState}
            />
          ) : null}
          <InputCheckbox
            formik={formik}
            name="setupOrganizationSSOSP"
            label="Setup this organization as Service Provider"
            onBlur={formik.handleBlur}
            inputWrapperClassName="mb-3"
            checked={formik.values.setupOrganizationSSOSP}
            value={formik.values.setupOrganizationSSOSP}
            onChange={() => {
              const curr = formik.values.setupOrganizationSSOSP;
              formik.setFieldValue('setupOrganizationSSOSP', !curr);

              if (!curr) {
                formik.setFieldValue('setupOrganizationSSOIDP', false);
              }
            }}
          />
          {formik.values.setupOrganizationSSOSP ? (
            <OrganizationSSOSPInfoForm
              formik={formik}
              organization={organization}
              saveMetadata={saveSPMetadataToState}
              saveCertificate={saveSPCertificateToState}
            />
          ) : null}
        </div>

        <button
          className="outline-none focus:outline-none mb-3 w-full cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
          type="submit"
        >
          {organization ? 'Update' : 'Add'} organization
        </button>
      </form>
    </div>
  );
};

export default OrganizationForm;
