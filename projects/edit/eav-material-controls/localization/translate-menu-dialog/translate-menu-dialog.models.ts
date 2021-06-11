import { FieldConfigSet } from '../../../form/model/field-config';
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
