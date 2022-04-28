import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { Language, LanguageCode } from '../models/language';

export const useLocaleText = () => {
  const { locale } = useRouter();

  return useCallback(
    (text?: Language | string | null): string => {
      // in case entity doesn't return language object
      if (typeof text === 'string') return text;

      if (text !== null || text !== undefined) {
        // make sure text actually has a `th` value before returning it
        if (locale === LanguageCode.TH && text.nameTh?.trim().length > 0) {
          return text.nameTh;
        }

        // default to english
        return text.nameEn;
      }

      return '';
    },
    [locale],
  );
};
