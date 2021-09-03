import { TranslationLink } from '../../../../shared/constants';
import { TranslationState } from '../../../../shared/models';

export interface TranslationStateCore {
  linkType: TranslationLink;
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
