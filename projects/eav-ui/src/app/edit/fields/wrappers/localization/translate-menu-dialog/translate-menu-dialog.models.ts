import { TranslationStateCore } from '../../../../localization/translate-state.model';

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

//
