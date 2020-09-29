import { defaultTemplateName, defaultTokenName } from '../../../../../ng-dialogs/src/app/shared/constants/file-names.constants';
import { TemplateTypes } from './string-template-picker.models';

export const templateTypes: TemplateTypes = {
  Token: {
    ext: '.html',
    prefix: '',
    suggestion: defaultTokenName,
  },
  'C# Razor': {
    ext: '.cshtml',
    prefix: '_',
    suggestion: defaultTemplateName,
  },
};
