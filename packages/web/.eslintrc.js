module.exports = {
  globals: {
    React: 'writable',
  },
  env: {
    browser: true,
    jest: true,
    node: true,
    es6: true,
  },
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: ['@seaccentral/*'],
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.js', '**/*.jsx'],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@next/next/recommended',
        'plugin:prettier/recommended',
      ],
      rules: {
        'prettier/prettier': 'error',
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react/no-unescaped-entities': 'off',
        'no-unused-vars': 'warn',
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
      plugins: ['@typescript-eslint', '@next/next', 'prettier'],
      extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@next/next/recommended',
        'prettier',
      ],
      rules: {
        'prettier/prettier': 'error',
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react/no-unescaped-entities': 'off',
        'no-empty-function': 'off',
        'object-shorthand': ['error', 'always', { avoidQuotes: true }],
        '@typescript-eslint/ban-ts-comment': 'warn',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@next/next/no-img-element': 'off',
      },
    },
  ],
};
