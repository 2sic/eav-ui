import { defaultTemplateName, defaultTokenName } from '../../../../../ng-dialogs/src/app/shared/constants/file-names.constants';
import { TemplateTypes } from './string-template-picker.models';

export const templateTypes: TemplateTypes = {
  Token: {
    ext: '.html',
    prefix: '',
    purpose: 'token',
    suggestion: defaultTokenName,
  },
  'C# Razor': {
    ext: '.cshtml',
    prefix: '_',
    purpose: 'razor',
    suggestion: defaultTemplateName,
  },

  // New in 12.02 - won't show up in the selection-dropdown but is used for Controller-Selectors
  'C# Search': {
    ext: '.cs',
    prefix: '',
    purpose: 'search',
    suggestion: 'SearchMapper.cs'
  }
};
