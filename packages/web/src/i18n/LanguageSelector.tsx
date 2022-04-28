import { useRouter } from 'next/router';

import { setNextLocaleCookie } from './lang-utils';

const LANGUAGES = {
  TH: 'th',
  EN: 'en',
};

const LanguageButton = ({ onChangeLanguage, lng }) => {
  return (
    <button onClick={() => onChangeLanguage(lng)}>
      <u>{lng.toUpperCase()}</u>
    </button>
  );
};

const LanguageSelector = () => {
  const router = useRouter();
  const { locale, defaultLocale } = router;

  function onChangeLanguage(newLng) {
    const currentPath = router.asPath.replace(`/${locale}`, '');
    const newPath = `${
      newLng === defaultLocale ? '' : '/' + newLng
    }${currentPath}`;

    setNextLocaleCookie(newLng);
    window.location.href = newPath;
  }

  return (
    <div>
      {locale !== LANGUAGES.EN ? (
        <LanguageButton
          lng={LANGUAGES.EN}
          onChangeLanguage={onChangeLanguage}
        />
      ) : null}
      {locale !== LANGUAGES.TH ? (
        <LanguageButton
          lng={LANGUAGES.TH}
          onChangeLanguage={onChangeLanguage}
        />
      ) : null}
    </div>
  );
};

export default LanguageSelector;
