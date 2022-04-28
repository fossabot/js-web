import { parse } from 'cookie';
import { useRouter } from 'next/router';
import { Language } from '../models/language';

export const DEFAULT_LOCALE = 'en';

/**
 * Set Next.js locale cookie.
 * @param locale locale code (eg: en, th).
 */
export function setNextLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;`;
}

/**
 * Put default language into cookie.
 */
export function setDefaultLangCookie() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { locale, defaultLocale } = useRouter();

  if (typeof window === 'object') {
    const l = parse(document.cookie);

    if (!l || !l.NEXT_LOCALE) {
      setNextLocaleCookie(locale || defaultLocale);
    } else if (l && locale && l.NEXT_LOCALE && l.NEXT_LOCALE !== locale) {
      setNextLocaleCookie(locale);
    }
  }
}

/**
 * Get prepend locale path.
 * @param locale locale code (eg: en, th)
 * @returns prepended locale path.
 */
export function getPrependLocale(locale: string) {
  return locale && locale !== DEFAULT_LOCALE ? `/${locale}` : '';
}

/**
 * Redirect to path and prepend with locale code.
 * @param locale locale code. (eg: en, th)
 * @param path path that we want to redirect.
 */
export function redirectToPathWithLocale(locale: string, path: string) {
  window.location.href = `${getPrependLocale(locale)}${path}`;
}

/**
 * Get current locale from cookie.
 * @returns current locale extract from cookie.
 */
export function getSelectedLang() {
  if (typeof window === 'object') {
    const l = parse(document.cookie);

    if (l && l.NEXT_LOCALE) {
      return l.NEXT_LOCALE;
    } else {
      return DEFAULT_LOCALE;
    }
  }
}

/**
 * Get 2 leading characters of current locale. (eg: En, Th)
 * @returns 2 leading characters of current locale.
 */
export function getLocaleTitle() {
  const locale = getSelectedLang();
  if (!locale || locale.length < 2) throw new Error('Invalid locale');

  return locale[0].toUpperCase() + locale.substr(1);
}

/**
 * Extract value for current locale from given language model
 * @param lang language model.
 * @returns String value from current locale.
 */
export function getLanguageValue(lang: Language) {
  const locale = getLocaleTitle();
  return lang['name' + locale] || lang.nameEn || '';
}
