import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import API_PATHS from '../../constants/apiPaths';
import { centralHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import Layout from '../../layouts/main.layout';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../../tailwind.config';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import { UserCertificate } from '../../models/certificate';
import MainNavbar from '../../ui-kit/headers/MainNavbar';
import TopNavbar from '../components/TopNavbar';
import countBy from 'lodash/countBy';
import { CertificateProviderButton } from './CertificateProviderButton';
import InputSelect from '../../ui-kit/InputSelect';
import certificate from '../../../pages/dashboard/certificate';
import Picture from '../../ui-kit/Picture';
import { useResponsive } from '../../hooks/useResponsive';
import { UserCertificateCard } from './UserCertificateCard';

const { theme } = resolveConfig(tailwindConfig);

function DashboardCertificatePage({ token }) {
  const { lg } = useResponsive();
  const { t } = useTranslation();

  const [userCertificates, setUserCertificates] =
    useState<UserCertificate[] | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'alpha'>('recent');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const filteredUserCertificates = useMemo(() => {
    return userCertificates
      ?.filter(
        (certificate) =>
          selectedProvider === null ||
          certificate.provider === selectedProvider,
      )
      .sort((a, b) => {
        if (sortBy === 'alpha') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'recent') {
          return (
            new Date(b.completedDate).getTime() -
            new Date(a.completedDate).getTime()
          );
        }
        return 0;
      });
  }, [userCertificates, sortBy, selectedProvider]);

  useEffect(() => {
    centralHttp
      .get<BaseResponseDto<UserCertificate[]>>(API_PATHS.CERTIFICATES_ME)
      .then((res) => {
        setUserCertificates(res.data.data);
      })
      .catch(console.error);
  }, []);

  const providers = useMemo(() => {
    if (userCertificates) {
      return countBy(userCertificates, (certificate) => certificate.provider);
    }
    return {};
  }, [userCertificates]);

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {t('dashboardCertificatesPage.certificates')}
        </title>
      </Head>
    ),
    [],
  );

  const sortByOptions = [
    { label: t('dashboardCertificatesPage.mostRecent'), value: 'recent' },
    { label: t('dashboardCertificatesPage.alphabetical'), value: 'alpha' },
  ];

  const sortDropdown = (
    <InputSelect
      name="sort"
      renderOptions={sortByOptions}
      value={sortByOptions.find((option) => option.value === sortBy)}
      onBlur={() => {
        //
      }}
      onChange={(event) => {
        setSortBy(event.target.value);
      }}
      overrideStyles={
        lg
          ? undefined
          : {
              control: () => ({
                padding: `0px ${theme.padding['4']}`,
                border: 0,
                height: 'calc(100% - 1px)',
              }),
            }
      }
    />
  );

  return (
    <Layout
      head={head}
      header={<MainNavbar token={token} />}
      noMobilePadding={true}
      topContent={
        <div className="sticky left-0 top-16 z-40">
          <TopNavbar />
          <div className="block border-b border-gray-200 py-2 lg:hidden">
            {sortDropdown}
          </div>
        </div>
      }
    >
      <div className="relative mx-auto flex flex-1 flex-col lg:w-244 lg:flex-row">
        <div
          className="hidden border-r border-gray-200 p-3 lg:block"
          style={{ minWidth: '15rem' }}
        >
          <div className="sticky top-36 flex flex-col space-y-2">
            <CertificateProviderButton
              isActive={selectedProvider === null}
              onClick={() => setSelectedProvider(null)}
            >
              {t('dashboardCertificatesPage.allCertificates')}
            </CertificateProviderButton>
            {Object.keys(providers).map((provider) => (
              <CertificateProviderButton
                key={provider}
                onClick={() => setSelectedProvider(provider)}
                isActive={provider === selectedProvider}
              >
                {provider} ({providers[provider]})
              </CertificateProviderButton>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-6 bg-white p-6">
          {filteredUserCertificates && filteredUserCertificates.length > 0 && (
            <>
              <div className="flex justify-between">
                <div>
                  <h5 className="text-subtitle font-semibold">
                    {t('dashboardCertificatesPage.congratulations')}
                  </h5>
                  {userCertificates && (
                    <p className="mt-2 text-gray-500">
                      {userCertificates.length}{' '}
                      {certificate.length === 1
                        ? t('dashboardCertificatesPage.certificateFound')
                        : t('dashboardCertificatesPage.certificatesFound')}
                    </p>
                  )}
                </div>
                <div className="hidden w-55 lg:block">{sortDropdown}</div>
              </div>
              {filteredUserCertificates?.map((userCertificate) => (
                <UserCertificateCard
                  key={userCertificate.id}
                  userCertificate={userCertificate}
                />
              ))}
            </>
          )}
          {filteredUserCertificates && filteredUserCertificates.length === 0 && (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <Picture
                sources={[
                  {
                    srcSet: '/assets/empty.webp',
                    type: 'image/webp',
                  },
                ]}
                fallbackImage={{
                  src: '/assets/empty.png',
                }}
              />
              <h4 className="mt-8 text-heading font-semibold">
                {t('dashboardCertificatesPage.noCertificatesAvailable')}
              </h4>
              <p className="mt-2 text-gray-500">
                {t('dashboardCertificatesPage.findAndComplete')}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default DashboardCertificatePage;
