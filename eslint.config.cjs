const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const angularPlugin = require('@angular-eslint/eslint-plugin');
const angularTemplatePlugin = require('@angular-eslint/eslint-plugin-template');
const angularTemplateParser = require('@angular-eslint/template-parser');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['tsconfig.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@angular-eslint': angularPlugin,
      import: importPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'import/no-duplicates': 'error',
      'max-len': ['warn', { code: 140 }],
      semi: ['error', 'always'],
      eqeqeq: ['error', 'always'],
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplatePlugin,
    },
    rules: {
      '@angular-eslint/template/no-negated-async': 'error',
    },
  },
];
