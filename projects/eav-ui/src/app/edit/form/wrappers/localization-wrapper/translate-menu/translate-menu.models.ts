import { TranslationLink } from '../../../../shared/constants';
import { TranslationState } from '../../../../shared/models';
import { FormLanguage } from '../../../../shared/models/form-languages.model';

export interface TranslationStateCore {
  linkType: TranslationLink;
  language: string;
}

export interface TranslateMenuViewModel extends FormLanguage {
  translationState: TranslationState;
  translationStateClass: string;
  disableAutoTranslation: boolean;
  disabled: boolean;

  disableTranslateButton: boolean;
}
