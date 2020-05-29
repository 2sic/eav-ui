import { TemplateTypes } from './string-template-picker.models';
import { defaultTokenName, defaultTemplateName } from '../../../../../ng-dialogs/src/app/shared/constants/file-names.constants';

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
