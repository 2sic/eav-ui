import { TranslationState2New } from '../../../shared/models';

export interface TranslationState {
  linkType: string;
  language: string;
}

export interface TranslateMenuTemplateVars {
  currentLanguage: string;
  defaultLanguage: string;
  translationState: TranslationState2New;
  translationStateClass: string;
  disableTranslation: boolean;
  disabled: boolean;
}
