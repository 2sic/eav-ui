import { EavAttributes } from '../../../shared/models/eav';
import { TranslateMenuDialogData } from '../translate-menu-dialog/translate-menu-dialog.models';

export interface TranslateMenuTemplateVars {
  currentLanguage: string;
  defaultLanguage: string;
  attributes: EavAttributes;
  translationState: TranslateMenuDialogData;
  translationStateClass: string;
  disabled: boolean;
  defaultLanguageMissingValue: boolean;
  infoMessage: string;
  infoMessageLabel: string;
}
