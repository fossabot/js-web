import * as Yup from 'yup';

const idpRequiredSchema = Yup.object().shape({
  issuer: Yup.string().when('metadataFileName', {
    is: (metadata: string) => {
      return !metadata;
    },
    then: Yup.string().required('Required'),
  }),
  nameidFormat: Yup.string().optional(),
  metadataFileName: Yup.string(),
  ssoLoginUrl: Yup.string()
    .url()
    .when('metadataFileName', {
      is: (metadata: string) => {
        return !metadata;
      },
      then: Yup.string().required('Required'),
    }),
  certificateFileName: Yup.string().when('metadataFileName', {
    is: (metadata: string) => !metadata,
    then: Yup.string().required('Required'),
  }),
});

const idpOptionalSchema = Yup.object().shape({
  issuer: Yup.string().optional(),
  nameidFormat: Yup.string().optional(),
  metadataFileName: Yup.string(),
  ssoLoginUrl: Yup.string().url().optional(),
  certificateFileName: Yup.string().optional(),
});

const spRequiredSchema = Yup.object().shape({
  spAcsUrl: Yup.string().when('spMetadataFileName', {
    is: (spMetadataFileName: string) => !spMetadataFileName,
    then: Yup.string().required('Required'),
  }),
  spIssuer: Yup.string().when('spMetadataFileName', {
    is: (spMetadataFileName: string) => !spMetadataFileName,
    then: Yup.string().required('Required'),
  }),
  spMetadataFileName: Yup.string().optional(),
  spCertificateFileName: Yup.string().when('spMetadataFileName', {
    is: (spMetadataFileName: string) => !spMetadataFileName,
    then: Yup.string().required('Required'),
  }),
});

const spOptionalSchema = Yup.object().shape({
  spAcsUrl: Yup.string().optional(),
  spIssuer: Yup.string().optional(),
  spMetadataFileName: Yup.string().optional(),
  spCertificateFileName: Yup.string().optional(),
});

export const organizationSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  idp: Yup.object().when('setupOrganizationSSOIDP', {
    is: (setupOrganizationSSOIDP: string) => setupOrganizationSSOIDP === 'true',
    then: idpRequiredSchema.required('Required'),
    otherwise: idpOptionalSchema,
  }),
  sp: Yup.object().when('setupOrganizationSSOSP', {
    is: (setupOrganizationSSOSP: string) => setupOrganizationSSOSP === 'true',
    then: spRequiredSchema.required('Required'),
    otherwise: spOptionalSchema,
  }),
  setupOrganizationSSOIDP: Yup.string().required(),
  setupOrganizationSSOSP: Yup.string().required(),
});
