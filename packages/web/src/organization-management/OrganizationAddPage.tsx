import { useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaExclamation } from 'react-icons/fa';

import { centralHttp } from '../http';
import Layout from '../layouts/main.layout';
import ERRORS from '../constants/error';
import API_PATHS from '../constants/apiPaths';
import WEB_PATHS from '../constants/webPaths';
import OrganizationForm from './OrganizationForm';
import useTranslation from '../i18n/useTranslation';
import SuccessMessage from '../ui-kit/SuccessMessage';

const OrganizationAddPage = ({ token }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const [error, setError] = useState('');
  const [organization, setOrganization] = useState(null);
  const [successTitle, setSuccessTitle] = useState('');

  const executeScroll = () => scrollRef.current.scrollIntoView();

  async function onAddAction(
    organizationData: any,
    {
      uploadCertificate,
      uploadIDPMetadata,
      uploadSPMetadata,
      uploadSPCertificate,
    },
  ) {
    let certificateKey = '';
    let metadataKey = '';
    let spCertificateKey = '';
    let spMetadataKey = '';

    setSuccessTitle('');

    try {
      let organizationResponse = organization;

      if (!organization) {
        const response = await centralHttp.post(
          API_PATHS.ORGANIZATIONS,
          organizationData,
        );
        organizationResponse = response.data.data;

        setOrganization(organizationResponse);
      }

      if (organizationData.isIdentityProvider) {
        certificateKey = await uploadCertificate(
          API_PATHS.PREPARE_UPLOAD_IDP_CERTIFICATE.replace(
            ':id',
            organizationResponse.id,
          ),
          centralHttp,
        );
        metadataKey = await uploadIDPMetadata(
          API_PATHS.PREPARE_UPLOAD_IDP_METADATA.replace(
            ':id',
            organizationResponse.id,
          ),
          centralHttp,
        );
      }

      if (organizationData.isServiceProvider) {
        spCertificateKey = await uploadSPCertificate(
          API_PATHS.PREPARE_UPLOAD_SP_CERTIFICATE.replace(
            ':id',
            organizationResponse.id,
          ),
          centralHttp,
        );

        spMetadataKey = await uploadSPMetadata(
          API_PATHS.PREPARE_UPLOAD_SP_METADATA.replace(
            ':id',
            organizationResponse.id,
          ),
          centralHttp,
        );
      }

      if (certificateKey || metadataKey || spMetadataKey || spCertificateKey) {
        await centralHttp.put(
          API_PATHS.GET_ORGANIZATION_BY_ID.replace(
            ':id',
            organizationResponse.id,
          ),
          Object.assign(
            { ...organizationData },
            metadataKey ? { metadataKey } : null,
            spMetadataKey ? { spMetadataKey } : null,
            certificateKey ? { certificateKey } : null,
            spCertificateKey ? { spCertificateKey } : null,
          ),
        );
      }

      router.push(
        WEB_PATHS.ORGANIZATION_DETAIL.replace(':id', organizationResponse.id),
      );
    } catch (error) {
      if (error && error.response && error.response.status === 400) {
        if (error.response.data.data) {
          setError(error.response.data.data?.error);
        } else {
          setError(error.response.data.error);
        }
      } else {
        setError(ERRORS.GENERIC_NETWORK_ERROR);
      }

      executeScroll();
    }
  }

  return (
    <Layout token={token}>
      <Head>
        <title>{t('headerText')} | Add Organization</title>
      </Head>
      <div className="mx-auto mt-4 flex w-full max-w-md flex-col justify-start text-center">
        <SuccessMessage
          title={successTitle}
          onClearAction={() => setSuccessTitle('')}
        />
        <div className="mb-8" ref={scrollRef}>
          <h2 className="mb-2 py-2 text-2xl font-bold text-black">
            Setup Organization
          </h2>
        </div>
        <div>
          {error ? (
            <div className="mb-3 flex w-full flex-row items-center justify-start bg-red-100 p-5 text-left">
              <FaExclamation className="text-xl text-red-200" />
              <span className="ml-2 text-sm">{error}</span>
            </div>
          ) : null}
        </div>
        <OrganizationForm onAddAction={onAddAction} />
      </div>
    </Layout>
  );
};

export default OrganizationAddPage;
