import { TranslationStateCore } from '../../../../fields/wrappers/localization/translate-menu/translate-menu.models';

/** Reduced config set / info about a field */
export interface TranslateMenuDialogConfig {
  entityGuid: string;
  fieldName: string;
}

export interface TranslateMenuDialogData {
  config: TranslateMenuDialogConfig;
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

export interface TranslateMenuDialogViewModel {
  primary: string;
  languages: TranslateMenuDialogTemplateLanguage[];
  translationState: TranslationStateCore;
  showLanguageSelection: boolean;
  i18nRoot: string;
  submitDisabled: boolean;
}
