import { Language, LanguageCode } from '../language/Language.entity';
import { BANGKOK_TIMEZONE, DEFAULT_DATE_FORMAT } from './constants';
import { formatWithTimezone } from './date';

export function transformLanguage({ value }: { value: Language | string }) {
  if (typeof value === 'string') {
    return value;
  }
  const lang = value as Language;
  return lang
    ? {
        id: lang?.id,
        nameEn: lang?.nameEn,
        nameTh: lang?.nameTh,
      }
    : null;
}

export function getStringFromLanguage(
  language: Language | null | undefined,
  langCode: LanguageCode,
) {
  const defaultString = '';

  switch (langCode) {
    case LanguageCode.TH:
      return language?.nameTh || language?.nameEn || defaultString;
    case LanguageCode.EN:
      return language?.nameEn || defaultString;
    default:
      return defaultString;
  }
}

type LanguageType = Required<
  Omit<
    Language,
    | 'id'
    | 'isActive'
    | 'hasId'
    | 'reload'
    | 'createdAt'
    | 'updatedAt'
    | 'save'
    | 'remove'
    | 'softRemove'
    | 'recover'
  >
>;

export function getLanguageFromString({ ...args }: LanguageType) {
  const language = new Language();

  language.nameEn = args.nameEn;
  language.nameTh = args.nameEn;

  return language;
}

export function getLanguageFromDate(
  date: Date,
  format = DEFAULT_DATE_FORMAT,
  timeZone = BANGKOK_TIMEZONE,
) {
  const language = new Language();

  language.nameEn = formatWithTimezone(date, timeZone, format);
  language.nameTh = formatWithTimezone(date, timeZone, format, LanguageCode.TH);

  return language;
}
