// projects/eav-ui/src/eslint.config.js

import js from '@eslint/js';

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
    rules: {
      eqeqeq: ['error', 'always'], // this is for === and !==
      quotes: ['warn', 'single'], // this is for single quotes
      semi: ['warn', 'always'], // this is for semicolons
    },
  },
];
