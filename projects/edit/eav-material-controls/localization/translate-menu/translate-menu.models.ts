import { TranslationStateFull } from '../../../shared/models';

export interface TranslationState {
  linkType: string;
  language: string;
}

export interface TranslateMenuTemplateVars {
  currentLanguage: string;
  defaultLanguage: string;
  translationState: TranslationStateFull;
  translationStateClass: string;
  disableTranslation: boolean;
  disabled: boolean;
}
