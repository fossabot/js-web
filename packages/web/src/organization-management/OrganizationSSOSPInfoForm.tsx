import FileUpload from '../ui-kit/FileUpload';
import InputSection from '../ui-kit/InputSection';

const OrganizationSSOSPInfoForm = ({
  formik,
  organization,
  saveMetadata,
  saveCertificate,
}) => {
  return (
    <div>
      {organization?.isServiceProvider ? (
        <div className="mb-6 text-left">
          <p className="mb-1 text-xs">
            Update the metadata to your organization SSO Config → Identity
            Provider Details:
            <a
              className="ml-1 text-blue-500 underline"
              href={organization?.sso?.idp?.issuer}
              target="_blank"
              download
              rel="noreferrer"
            >
              IDP Metadata
            </a>
          </p>
        </div>
      ) : null}
      <InputSection
        formik={formik}
        name="sp.spAcsUrl"
        label="Application Callback URL"
        placeholder="https://samlp.example.com/callback"
        onBlur={formik.handleBlur}
        inputWrapperClassName="mb-3"
        value={formik.values.sp.spAcsUrl}
        onChange={formik.handleChange}
        error={formik.touched.sp?.spAcsUrl && formik.errors.sp?.spAcsUrl}
      />
      <InputSection
        name="sp.spIssuer"
        formik={formik}
        label="Entity Id"
        placeholder="https://samlp.example.com/issuer/1"
        onBlur={formik.handleBlur}
        value={formik.values.sp.spIssuer}
        inputWrapperClassName="mb-3"
        onChange={formik.handleChange}
        error={formik.touched.sp?.spIssuer && formik.errors.sp?.spIssuer}
      />
      <FileUpload
        name="sp.spCertificateFileName"
        label="Upload x509 Signing Certificate"
        isExisting={
          !!organization?.sso?.sp?.certificateFileName &&
          organization.sso.sp.certificateFileName ===
            formik.values.sp.spCertificateFileName
        }
        value={formik.values.sp.spCertificateFileName}
        inputWrapperClassName="mb-3"
        onChange={(e) => saveCertificate(e, formik)}
        error={
          formik.touched.sp?.spCertificateFileName &&
          formik.errors.sp?.spCertificateFileName
        }
        accept={['.pem', '.cer', '.cert']}
      />
      <div className="mb-3 flex w-full flex-row items-center justify-center">
        <hr className="h-px w-full border-0 bg-gray-400 text-white" />
        <span className="mx-2">or</span>
        <hr className="h-px w-full border-0 bg-gray-400 text-white" />
      </div>
      <FileUpload
        name="sp.spMetadataFileName"
        label="Upload SP Metadata"
        isExisting={
          !!organization?.sso?.sp?.metadataFileName &&
          organization.sso.sp.metadataFileName ===
            formik.values.sp.spMetadataFileName
        }
        value={formik.values.sp.spMetadataFileName}
        inputWrapperClassName="mb-3"
        onChange={(e) => saveMetadata(e, formik)}
        accept={['.xml']}
      />
    </div>
  );
};

export default OrganizationSSOSPInfoForm;
