import { TemplateTypes } from './string-template-picker.models';

export const templateTypes: TemplateTypes = {
  Token: {
    ext: '.html',
    purpose: 'token',
  },
  'C# Razor': {
    ext: '.cshtml',
    purpose: 'razor',
  },
} as const;
