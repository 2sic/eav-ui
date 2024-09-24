import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import angular from '@angular-eslint/eslint-plugin';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.html'],
    ignores: [
      '/dist',
      '/node_modules',
      '/build-helpers',
      '/projects/edit-types',
      '/projects/field-custom-gps',
      '/projects/field-string-wysiwyg',
    ],
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: './tsconfig.json', // Pfad zu deiner tsconfig.json
        tsconfigRootDir: './', // Basisverzeichnis
        sourceType: 'module', // Modultyp
      },
    },
    plugins: {
      typescript: typescript,
      angular: angular,
    },
    rules: {
      eqeqeq: ['error', 'always'], // for === and !==
      quotes: ['warn', 'single'], // for single quotes
      semi: ['warn', 'always'], // for semicolons
    },
  },
];
