module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
    jest: {
      version: 26,
    },
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-var-requires': 'off',
    quotes: [2, 'single', { avoidEscape: true }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        ts: 'never',
      },
    ],
    'no-await-in-loop': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'class-methods-use-this': 'off',
    camelcase: 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'no-underscore-dangle': 'off',
    'no-useless-constructor': 'off',
    'import/no-extraneous-dependencies': ['off'],
    'no-param-reassign': 0,
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'date-fns',
            importNames: ['format'],
            message: 'Please use formatWithTimezone from core /utils/date',
          },
          {
            name: 'date-fns-tz',
            importNames: ['format'],
            message: 'Please use formatWithTimezone from core /utils/date',
          },
        ],
        patterns: [
          {
            group: ['../../dist/*'],
            message: 'Import on /dist.. folder is frown-upon',
          },
          {
            group: ['@seaccentral/*'],
            message: 'Core package should not import other packages file',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['*.json'],
      rules: {
        'no-unused-expressions': 'off',
        quotes: 'off',
      },
    },
    {
      files: ['src/migrations/*.ts'],
      rules: {
        'class-methods-use-this': 'off',
        quotes: 'off',
      },
    },
  ],
  globals: {},
  ignorePatterns: ['dist/'],
};
