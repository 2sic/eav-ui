import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { TranslationState } from '../translate-menu/translate-menu.models';

export interface TranslateMenuDialogData {
  config: FieldConfigSet;
  translationState: TranslationState;
}

export interface TranslateMenuDialogTemplateLanguage {
  key: string;
  disabled: boolean;
}

export interface TranslateMenuDialogTemplateVars {
  defaultLanguage: string;
  languages: TranslateMenuDialogTemplateLanguage[];
  translationState: TranslationState;
  showLanguageSelection: boolean;
  i18nRoot: string;
  submitDisabled: boolean;
}
