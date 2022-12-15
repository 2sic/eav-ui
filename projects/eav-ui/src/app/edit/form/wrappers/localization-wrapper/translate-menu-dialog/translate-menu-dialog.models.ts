import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { TranslationStateCore } from '../translate-menu/translate-menu.models';

export interface TranslateMenuDialogData {
  config: FieldConfigSet;
  translationState: TranslationStateCore;
  isTranslateMany?: boolean;
  translatableFields?: string[];
}

export interface TranslateMenuDialogTemplateLanguage {
  key: string;
  disabled: boolean;
  noTranslatableFields?: number;
  noTranslatableFieldsThatHaveContent?: number;
}

export interface TranslateMenuDialogTemplateVars {
  defaultLanguage: string;
  languages: TranslateMenuDialogTemplateLanguage[];
  translationState: TranslationStateCore;
  showLanguageSelection: boolean;
  i18nRoot: string;
  submitDisabled: boolean;
}
