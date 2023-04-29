import { TranslationLink } from '../../../../shared/constants';
import { TranslationState } from '../../../../shared/models';

export interface TranslationStateCore {
  linkType: TranslationLink;
  language: string;
}

export interface TranslateMenuViewModel {
  readOnly: boolean;
  currentLanguage: string;
  defaultLanguage: string;
  translationState: TranslationState;
  translationStateClass: string;
  disableTranslation: boolean;
  disableAutoTranslation: boolean;
  disabled: boolean;
}
