import { TranslationLink } from '../../../../localization/translation-link.constants';
import { TranslationState } from '../../../../state/fields-configs.model';
import { FormLanguage } from '../../../../state/form-languages.model';

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
