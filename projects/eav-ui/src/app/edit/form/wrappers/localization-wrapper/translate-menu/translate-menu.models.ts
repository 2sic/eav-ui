import { TranslationLink } from '../../../../shared/constants';
import { TranslationState } from '../../../../shared/models';

export interface TranslationStateCore {
  linkType: TranslationLink;
  language: string;
}

export interface TranslateMenuViewModel {
  currentLanguage: string;
  defaultLanguage: string;
  translationState: TranslationState;
  translationStateClass: string;
  disableAutoTranslation: boolean;
  disabled: boolean;

  disableTranslateButton: boolean;
}
