import { TranslationState } from '../../../../shared/models';

export interface TranslationStateCore {
  linkType: string;
  language: string;
}

export interface TranslateMenuTemplateVars {
  currentLanguage: string;
  defaultLanguage: string;
  translationState: TranslationState;
  translationStateClass: string;
  disableTranslation: boolean;
  disabled: boolean;
}
