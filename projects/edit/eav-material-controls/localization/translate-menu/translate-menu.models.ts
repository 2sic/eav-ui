import { EavAttributes } from '../../../shared/models/eav';
import { LinkToOtherLanguageData } from '../../../shared/models/eav/link-to-other-language-data';

export interface TranslateMenuTemplateVars {
  currentLanguage: string;
  defaultLanguage: string;
  attributes: EavAttributes;
  translationState: LinkToOtherLanguageData;
  translationStateClass: string;
  disabled: boolean;
  defaultLanguageMissingValue: boolean;
  infoMessage: string;
  infoMessageLabel: string;
}
