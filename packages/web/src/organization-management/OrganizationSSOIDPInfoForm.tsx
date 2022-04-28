import FileUpload from '../ui-kit/FileUpload';
import InputSection from '../ui-kit/InputSection';

const OrganizationSSOIDPInfoForm = ({
  formik,
  saveCertificate,
  saveMetadata,
  organization,
}) => {
  return (
    <div>
      {organization?.isIdentityProvider ? (
        <div className="mb-6 text-left">
          <p className="mb-1 text-xs">
            Enter these into your organization SSO Config → Service Provider
            Details
          </p>
          <div className="mb-1 flex flex-row items-center justify-start font-semibold">
            <span className="mr-1 w-1/4 text-sm">Entity ID:</span>
            <span className="w-3/4 overflow-x-scroll bg-blue-200 px-2 text-xs leading-loose">
              {formik.values.sp?.spIssuer}
            </span>
          </div>
          <div className="flex flex-row items-center justify-start font-semibold">
            <span className="mr-1 w-1/4 text-sm">ACS URL:</span>
            <span className="w-3/4 overflow-x-scroll bg-blue-200 px-2 text-xs leading-loose">
              {formik.values.sp?.spAcsUrl}
            </span>
          </div>
        </div>
      ) : null}
      <InputSection
        formik={formik}
        name="idp.ssoLoginUrl"
        label="Sign In URL"
        placeholder="https://samlp.example.com/login"
        onBlur={formik.handleBlur}
        inputWrapperClassName="mb-3"
        value={formik.values.idp.ssoLoginUrl}
        onChange={formik.handleChange}
        error={
          formik.touched.idp?.ssoLoginUrl && formik.errors.idp?.ssoLoginUrl
        }
      />
      <InputSection
        name="idp.issuer"
        formik={formik}
        label="Entity Id"
        placeholder="https://samlp.example.com/metadata"
        onBlur={formik.handleBlur}
        value={formik.values.idp.issuer}
        inputWrapperClassName="mb-3"
        onChange={formik.handleChange}
        error={formik.touched.idp?.issuer && formik.errors.idp?.issuer}
      />
      <InputSection
        disabled
        name="idp.nameidFormat"
        formik={formik}
        label="User Id Attribute"
        placeholder="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        onBlur={formik.handleBlur}
        value={formik.values.idp.nameidFormat}
        inputWrapperClassName="mb-3"
        onChange={formik.handleChange}
      />
      <FileUpload
        name="idp.certificateFileName"
        label="Upload x509 Signing Certificate"
        isExisting={
          !!organization?.sso?.idp?.certificateFileName &&
          organization.sso.idp.certificateFileName ===
            formik.values.idp.certificateFileName
        }
        value={formik.values.idp.certificateFileName}
        inputWrapperClassName="mb-3"
        onChange={(e) => saveCertificate(e, formik)}
        error={
          formik.touched.idp?.certificateFileName &&
          formik.errors.idp?.certificateFileName
        }
        accept={['.pem', '.cer', '.cert']}
      />
      <div className="mb-3 flex w-full flex-row items-center justify-center">
        <hr className="h-px w-full border-0 bg-gray-400 text-white" />
        <span className="mx-2">or</span>
        <hr className="h-px w-full border-0 bg-gray-400 text-white" />
      </div>
      <FileUpload
        name="idp.metadataFileName"
        label="Upload IDP Metadata"
        isExisting={
          !!organization?.sso?.idp?.metadataFileName &&
          organization.sso.idp.metadataFileName ===
            formik.values.idp.metadataFileName
        }
        value={formik.values.idp.metadataFileName}
        inputWrapperClassName="mb-3"
        onChange={(e) => saveMetadata(e, formik)}
        accept={['.xml']}
      />
    </div>
  );
};

export default OrganizationSSOIDPInfoForm;
