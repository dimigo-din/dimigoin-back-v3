module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'import/prefer-default-export': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'lines-between-class-members': 'off',
    'consistent-return': 'off',
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'max-classes-per-file': 'off',
    'class-methods-use-this': 'off',
    'implicit-arrow-linebreak': 'off',
    'no-return-await': 'off',
    'no-await-in-loop': 'off',
    'max-len': 'off',
    'no-restricted-syntax': 'off',
    radix: 'off',
    'brace-style': 'off',
    'no-return-assign': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error', { args: 'none' },
    ],
    'no-unused-vars': [
      'error', { args: 'none' },
    ],
  },
};
