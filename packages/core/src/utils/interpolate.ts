import Handlebars from 'handlebars';
import { plainToClass } from 'class-transformer';
import { NotifyData } from '../queue/queueMetadata';
import { Language, LanguageCode } from '../language/Language.entity';
import { getStringFromLanguage } from './language';

type BuiltinHelperName =
  | 'helperMissing'
  | 'blockHelperMissing'
  | 'each'
  | 'if'
  | 'unless'
  | 'with'
  | 'log'
  | 'lookup';

type CustomHelperName = string;

type KnownHelpers = {
  [name in BuiltinHelperName | CustomHelperName]: boolean;
};

interface CompileOptions {
  data?: boolean;
  compat?: boolean;
  knownHelpers?: KnownHelpers;
  knownHelpersOnly?: boolean;
  noEscape?: boolean;
  strict?: boolean;
  assumeObjects?: boolean;
  preventIndent?: boolean;
  ignoreStandalone?: boolean;
  explicitPartialContext?: boolean;
}

Handlebars.registerHelper('incremented', (index) => {
  return index + 1;
});

/**
 * Interpolate the content with provided variables.
 * @param content Content as the string.
 * @param variables Key-Value Pairs object.
 * @returns Interpolated content.
 */
export function interpolate(
  content: string,
  variables: { [key: string]: unknown },
  options?: CompileOptions,
) {
  const template = Handlebars.compile(content, options);
  return template(variables);
}

/**
 * Generate object based on given variables and existing LanguageCode
 * @param variables Key(string)-Value(Language Entity) Pairs object.
 * @returns Object with LanguageCode as key
 */
export const generateVariables = (variables: NotifyData['variables']) => {
  return Object.values(LanguageCode).reduce(
    (obj: Record<LanguageCode, unknown>, lang: LanguageCode) => {
      const variablesByLangCode = Object.entries(variables).reduce(
        (v: Record<string, string | number>, [key, value]) => {
          const val = plainToClass(Language, value);

          if (val instanceof Language)
            v[key] = getStringFromLanguage(val, lang);
          else v[key] = val || '';

          return v;
        },
        {},
      );

      obj[lang] = variablesByLangCode;

      return obj;
    },
    {} as Record<LanguageCode, unknown>,
  );
};
