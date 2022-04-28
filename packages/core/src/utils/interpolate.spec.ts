import { Language } from '../language/Language.entity';
import { interpolate, generateVariables } from './interpolate';

describe('Interpolate Function', () => {
  it('should interpolate the content with provided variables', () => {
    const content = 'Hello {{name}}, You are {{age}} years old.';
    const variables = {
      name: 'John Doe',
      age: 55,
    };
    const expected = 'Hello John Doe, You are 55 years old.';
    const result = interpolate(content, variables);
    expect(result).toBe(expected);
  });

  it('should return content even if not provide matched variables', () => {
    const content = 'Hello {{name}}, You are {{age}} years old.';
    const expected = 'Hello , You are  years old.';
    const variables = { pet: 'Dog' };
    const result = interpolate(content, variables);
    expect(result).toBe(expected);
  });

  it('should support html tag', () => {
    const content = 'Lorem <strong>{{word}}</strong> dolor.';
    const expected = 'Lorem <strong>ipsum</strong> dolor.';
    const variables = { word: 'ipsum' };
    const result = interpolate(content, variables);
    expect(result).toBe(expected);
  });
});

describe('Generate variables by LanguageCode', () => {
  it('should generate correctly', () => {
    const name = <Language>{ nameEn: 'English', nameTh: 'ไทย' };

    const variables = {
      name,
      age: 55,
    };

    const result = generateVariables(variables);

    expect(result).toStrictEqual({
      th: { name: 'ไทย', age: 55 },
      en: { name: 'English', age: 55 },
    });
  });
});
