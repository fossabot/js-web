import { useRouter } from 'next/router';

import config from '../config';
import { ExternalLink } from '../ui-kit/icons';
import useTranslation from '../i18n/useTranslation';

export default function NoActivePackageBox() {
  const { t } = useTranslation();
  const router = useRouter();
  const { locale, defaultLocale } = router;

  return (
    <div className="mb-6 w-full lg:w-136 lg:odd:pr-3 lg:even:pl-3">
      <div className="rounded-3xl border border-gray-200 bg-gray-100 p-6 pb-8">
        <h3 className="mb-2 text-body font-semibold text-gray-500">
          {t('myPackagesPage.noActivePackageFound.title')}
        </h3>
        <div className="mb-6 text-caption text-gray-500">
          {t('myPackagesPage.noActivePackageFound.description')}
        </div>
        <a
          className="flex items-center text-body font-semibold text-brand-primary"
          target="_blank"
          rel="noopener noreferrer"
          // TODO: Change it to global packages instead of yournextu packages
          href={`${config.CORPORATE_WEB_BASE_URL}/${
            locale || defaultLocale
          }/yournextu/packages`}
        >
          <span>{t('myPackagesPage.noActivePackageFound.browsePackages')}</span>
          <ExternalLink className="ml-2" />
        </a>
      </div>
    </div>
  );
}
