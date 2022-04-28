import { plainToClass } from 'class-transformer';
import { Language, LanguageCode } from '../language/Language.entity';
import { getStringFromLanguage } from './language';

function getMock(override?: Partial<Language>): Language {
  return plainToClass(Language, {
    nameEn: override ? override.nameEn : 'hello',
    nameTh: override ? override.nameTh : 'hello in Thai',
  });
}

describe('language', () => {
  describe('getStringFromLanguage', () => {
    it('should return Thai translation', () => {
      const mockLocale = getMock();
      const actual = getStringFromLanguage(mockLocale, LanguageCode.TH);
      expect(actual).toEqual(mockLocale.nameTh);
    });

    it('should return English translation', () => {
      const mockLocale = getMock();
      const actual = getStringFromLanguage(mockLocale, LanguageCode.EN);
      expect(actual).toEqual(mockLocale.nameEn);
    });

    it('should return empty string when there is no translation', () => {
      const mockLocale = getMock({ nameTh: undefined });
      const actual = getStringFromLanguage(mockLocale, LanguageCode.TH);

      expect(actual).not.toEqual(mockLocale.nameEn);
      expect(actual).toEqual('');
    });
  });
});
