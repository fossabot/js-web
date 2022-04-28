import cx from 'classnames';
import {
  setNextLocaleCookie,
  getSelectedLang,
  DEFAULT_LOCALE,
} from '../../i18n/lang-utils';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronRight } from '../icons';
import useTranslation from '../../i18n/useTranslation';
import { languageOptions } from '../../models/language';

export default function LanguageSwitcher() {
  const router = useRouter();
  const { t } = useTranslation();
  const { locale, defaultLocale } = router;
  const box = useRef<any>();
  const [showMenu, setShowMenu] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState(DEFAULT_LOCALE);
  const handleClickCurrentLang = () => {
    setShowMenu(!showMenu);
  };

  const handleClickLangauge = (newLocale: string) => {
    if (newLocale === selectedLocale) return;

    setNextLocaleCookie(newLocale);
    setSelectedLocale(newLocale);
    setShowMenu(false);

    const currentPath = router.asPath.replace(`/${locale}`, '');
    const newPath = `${
      newLocale === defaultLocale ? '' : '/' + newLocale
    }${currentPath}`;
    window.location.href = newPath;
  };

  const handleClickOutside = (event) => {
    if (box.current && !box?.current?.contains(event.target)) {
      setShowMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () =>
      document.removeEventListener('click', handleClickOutside, true);
  }, []);

  const menuList = useMemo(
    () => (
      <div
        className={cx(
          'absolute shadow-lg lg:absolute lg:left-auto lg:-top-4 lg:right-full lg:mr-4 lg:h-auto lg:rounded-lg lg:p-4',
          'left-0 top-0 right-0 flex h-screen w-full flex-col bg-white',
        )}
      >
        <div
          className={cx(
            'sticky flex items-center px-6 py-4 text-body font-semibold text-black lg:hidden',
            'border-b border-[#ECEDED]',
          )}
          onClick={() => setShowMenu(false)}
        >
          <ArrowLeft className="mr-5" /> {t('catalogMenu.back')}
        </div>
        <ul>
          {Object.keys(languageOptions).map((locale) => (
            <li
              key={locale}
              className={cx(
                'flex cursor-pointer justify-between whitespace-nowrap ',
                'rounded-lg px-6 py-4 text-caption text-gray-600 hover:bg-red-100 lg:px-3 lg:py-2',
              )}
              onClick={() => handleClickLangauge(locale)}
            >
              <div
                className={cx(
                  languageOptions[locale] === languageOptions[selectedLocale] &&
                    'font-semibold text-brand-primary',
                )}
              >
                {languageOptions[locale]}
              </div>
              <div className="justify-end">
                {languageOptions[locale] ===
                  languageOptions[selectedLocale] && (
                  <Check className="h-5 w-5" />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    ),
    [selectedLocale],
  );

  useEffect(() => {
    const selectedLocale = getSelectedLang();
    setSelectedLocale(selectedLocale);
  }, []);

  return (
    <div className="lg:relative" ref={box}>
      <div
        className="flex flex-none cursor-pointer items-center justify-between whitespace-nowrap text-caption font-regular text-gray-600"
        onClick={handleClickCurrentLang}
      >
        {t('navbar.language')} : {languageOptions[selectedLocale]}
        <ChevronRight className="ml-1 h-5 w-5" />
      </div>
      {showMenu && menuList}
    </div>
  );
}
