import { useRouter } from 'next/router';
import { IntlProvider } from 'react-intl';
import flatten from 'flat';

import en from '../../lang/en.json';
import th from '../../lang/th.json';

const locales = {
  en,
  th,
};

const Provider = ({ children }) => {
  const router = useRouter();
  const { locale, defaultLocale } = router;
  const messages: Record<string, string> = flatten(locales[locale]);

  return (
    <IntlProvider
      locale={locale}
      defaultLocale={defaultLocale}
      messages={messages}
    >
      {children}
    </IntlProvider>
  );
};

export default Provider;
