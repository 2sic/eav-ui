import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { TranslationStateCore } from '../translate-menu/translate-menu.models';

export interface TranslateMenuDialogData {
  config: FieldConfigSet;
  translationState: TranslationStateCore;
}

export interface TranslateMenuDialogTemplateLanguage {
  key: string;
  disabled: boolean;
}

export interface TranslateMenuDialogTemplateVars {
  defaultLanguage: string;
  languages: TranslateMenuDialogTemplateLanguage[];
  translationState: TranslationStateCore;
  showLanguageSelection: boolean;
  i18nRoot: string;
  submitDisabled: boolean;
}
