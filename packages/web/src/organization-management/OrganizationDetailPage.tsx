import Error from 'next/error';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import API_PATHS from '../constants/apiPaths';
import WEB_PATHS from '../constants/webPaths';
import { centralHttp } from '../http';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import ErrorMessages from '../ui-kit/ErrorMessage';
import SuccessMessage from '../ui-kit/SuccessMessage';
import OrganizationForm from './OrganizationForm';

const OrganizationDetailPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;

  const [isLoading, setIsLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [successTitle, setSuccessTitle] = useState('');
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      centralHttp
        .get(API_PATHS.GET_ORGANIZATION_BY_ID.replace(':id', id as string))
        .then((response) => {
          setOrganization(response.data.data);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  async function onSaveAction(
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
    setErrors([]);

    try {
      if (organizationData.isIdentityProvider) {
        certificateKey = await uploadCertificate(
          API_PATHS.PREPARE_UPLOAD_IDP_CERTIFICATE.replace(
            ':id',
            organization.id,
          ),
          centralHttp,
        );
        metadataKey = await uploadIDPMetadata(
          API_PATHS.PREPARE_UPLOAD_IDP_METADATA.replace(':id', organization.id),
          centralHttp,
        );
      }

      if (organizationData.isServiceProvider) {
        spCertificateKey = await uploadSPCertificate(
          API_PATHS.PREPARE_UPLOAD_SP_CERTIFICATE.replace(
            ':id',
            organization.id,
          ),
          centralHttp,
        );

        spMetadataKey = await uploadSPMetadata(
          API_PATHS.PREPARE_UPLOAD_SP_METADATA.replace(':id', organization.id),
          centralHttp,
        );
      }

      await centralHttp.put(
        API_PATHS.GET_ORGANIZATION_BY_ID.replace(':id', organization.id),
        Object.assign(
          { ...organizationData },
          metadataKey ? { metadataKey } : null,
          spMetadataKey ? { spMetadataKey } : null,
          certificateKey ? { certificateKey } : null,
          spCertificateKey ? { spCertificateKey } : null,
        ),
      );

      setOrganization({
        ...organization,

        isIdentityProvider: organizationData.isIdentityProvider,
        isServiceProvider: organizationData.isServiceProvider,
        sso: {
          ...organization.sso,
          idp: {
            ...organization.sso.idp,
            certificateFileName: organizationData.certificateFileName,
            metadataFileName: organizationData.metadataFileName,
          },
          sp: {
            ...organization.sso.sp,
            certificateFileName: organizationData.spCertificateFileName,
            metadataFileName: organizationData.spMetadataFileName,
          },
        },
      });
      setSuccessTitle('Updated successfully');
    } catch (err) {
      console.error(err);
      setErrors(['Something went wrong']);
    }
  }

  if (isLoading) return null;
  if (!organization || !organization.id) return <Error statusCode={404} />;

  return (
    <AdminLayout>
      <Head>
        <title>{t('headerText')} | Organization Detail</title>
      </Head>
      <div className="mx-auto mt-4 flex w-full max-w-md flex-col justify-start text-center">
        <SuccessMessage
          title={successTitle}
          onClearAction={() => setSuccessTitle('')}
        />
        <ErrorMessages messages={errors} onClearAction={() => setErrors([])} />
        <div className="mb-8">
          <h2 className="mb-2 py-2 text-2xl font-bold text-black">
            Organization detail and settings
          </h2>
        </div>
        <div className="mb-2 flex flex-row justify-start text-right">
          <button
            className="outline-none focus:outline-none mr-1 mb-3 w-36 cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
            onClick={() =>
              router.push(`${WEB_PATHS.ADMIN_INVITE_USER}?organization=${id}`)
            }
          >
            Invite user
          </button>
          {!organization.isServiceProvider ? (
            <>
              <button
                className="outline-none focus:outline-none mx-1 mb-3 w-36 cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
                type="submit"
                onClick={() => {
                  router.push(
                    WEB_PATHS.ORGANIZATION_USER_UPLOAD_HISTORY.replace(
                      ':id',
                      organization.id,
                    ),
                  );
                }}
              >
                Upload users
              </button>
              <button
                className="outline-none focus:outline-none ml-1 mb-3 w-36 cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
                type="submit"
                onClick={() => {
                  router.push(
                    WEB_PATHS.ORGANIZATION_LIST_USER.replace(
                      ':id',
                      organization.id,
                    ),
                  );
                }}
              >
                List users
              </button>
            </>
          ) : (
            <button
              className="outline-none focus:outline-none ml-1 mb-3 w-36 cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
              type="submit"
              onClick={() => {
                router.push(
                  WEB_PATHS.EXTERNAL_PROVIDER_PLANS_PAGE.replace(
                    ':id',
                    organization.id,
                  ),
                );
              }}
            >
              Link plans
            </button>
          )}
        </div>

        <div>
          <OrganizationForm
            onAddAction={onSaveAction}
            organization={organization}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrganizationDetailPage;
