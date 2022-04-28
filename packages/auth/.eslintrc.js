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
    'no-useless-catch': 'off',
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
            name: 'date-fns',
            importNames: ['startOfDay', 'endOfDay'],
            message:
              'Please use request header => Start-Of-Day, End-Of-Day, Now, End-Of-Range',
          },
          {
            name: 'date-fns-tz',
            importNames: ['format'],
            message: 'Please use formatWithTimezone from core /utils/date',
          },
        ],
        patterns: [
          {
            group: ['@seaccentral/core/src/*', '**/../core/*'],
            message: 'Use import @seaccentral/core/dist/.. instead',
          },
          {
            group: ['../../dist/*'],
            message: 'Import on /dist.. folder in frown-upon',
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
