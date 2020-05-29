import { TemplateTypes } from './string-template-picker.models';
import { defaultTokenName, defaultTemplateName } from '../../../../../ng-dialogs/src/app/shared/constants/file-names.constants';

export const templateTypes: TemplateTypes = {
  Token: {
    ext: '.html',
    prefix: '',
    suggestion: defaultTokenName,
    body: '<p>You successfully created your own template. Start editing it by hovering the "Manage" button and opening the "Edit Template" dialog.</p>',
  },
  'C# Razor': {
    ext: '.cshtml',
    prefix: '_',
    suggestion: defaultTemplateName,
    body: '<p>You successfully created your own template. Start editing it by hovering the "Manage" button and opening the "Edit Template" dialog.</p>',
  },
};
