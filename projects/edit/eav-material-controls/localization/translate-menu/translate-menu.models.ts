export interface TranslationState {
  linkType: string;
  language: string;
}

export interface TranslateMenuTemplateVars {
  currentLanguage: string;
  defaultLanguage: string;
  translationState: TranslationState;
  translationStateClass: string;
  disabled: boolean;
  defaultLanguageMissingValue: boolean;
  infoMessage: string;
  infoMessageLabel: string;
}
