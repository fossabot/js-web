import { useMemo } from 'react';
import Link from 'next/link';
import useTranslation from '../../i18n/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import { CORPORATE_WEB_PATHS } from '../../constants/webPaths';

export default function Footer() {
  const { t } = useTranslation();
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="w-full flex-shrink-0 border-t border-gray-300 bg-gray-100">
      <div className="flex flex-col justify-between px-6 py-4 lg:flex-row lg:items-center lg:px-8">
        <div className="flex-1 text-footnote text-gray-600">
          {t('footer.copyright')} &copy; {year} {t('headerText')}{' '}
          {t('footer.allRightsReserved')}
        </div>
        <div className="mt-4 flex lg:mt-0">
          <div className="mr-3 text-footnote font-semibold text-gray-600">
            <Link href={CORPORATE_WEB_PATHS.PRIVACY_POLICY}>
              <a className="border-r border-gray-600 pr-3">
                {t('footer.privacyPolicy')}
              </a>
            </Link>
            <Link href={CORPORATE_WEB_PATHS.TERMS_OF_USE}>
              <a className="border-r border-gray-600 px-3">
                {t('footer.termsOfUse')}
              </a>
            </Link>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
