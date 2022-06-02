import { TemplateTypes } from './string-template-picker.models';

export const templateTypes: TemplateTypes = {
  Token: {
    ext: '.html',
    purpose: 'Template',
    type: 'Token',
  },
  'C# Razor': {
    ext: '.cshtml',
    purpose: 'Template',
    type: 'Razor',
  },
  // New in 12.02 - won't show up in the selection-dropdown but is used for Controller-Selectors
  'C# Search': {
    ext: '.cs',
    purpose: 'Search',
  },
} as const;
