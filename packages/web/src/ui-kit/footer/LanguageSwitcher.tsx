import cx from 'classnames';
import {
  setNextLocaleCookie,
  getSelectedLang,
  DEFAULT_LOCALE,
} from '../../i18n/lang-utils';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Globe } from '../icons';
import { languageOptions } from '../../models/language';

export default function LanguageSwitcher() {
  const router = useRouter();
  const { locale, defaultLocale } = router;

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

  const menuList = useMemo(
    () => (
      <div className="absolute bottom-full right-0 mb-5 bg-white shadow-lg">
        <ul>
          {Object.keys(languageOptions).map((locale) => (
            <li
              key={locale}
              className={cx(
                'cursor-pointer whitespace-nowrap px-8 py-2 hover:bg-brand-primary hover:text-white',
              )}
              onClick={() => handleClickLangauge(locale)}
            >
              {languageOptions[locale]}
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
    <div className="relative text-footnote">
      <div
        className="flex flex-none cursor-pointer items-center whitespace-nowrap"
        onClick={handleClickCurrentLang}
      >
        <Globe className="mr-1" />
        <span>{languageOptions[selectedLocale]}</span>
        <ChevronRight className="ml-1" />
      </div>
      {showMenu && menuList}
    </div>
  );
}
