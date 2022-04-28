export interface Language {
  id?: string;
  nameEn: string;
  nameTh: string;
}

export const languageOptions = {
  en: 'English (EN)',
  th: 'ภาษาไทย (TH)',
};

export enum LanguageCode {
  EN = 'en',
  TH = 'th',
}

export enum LanguageCapitalized {
  EN = 'En',
  TH = 'Th',
}
