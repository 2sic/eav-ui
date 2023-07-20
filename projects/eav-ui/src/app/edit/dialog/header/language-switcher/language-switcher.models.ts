import { LanguageButton } from './language-switcher.helpers';

export interface LanguageSwitcherViewModel {
  currentLanguage: string;
  languageButtons: LanguageButton[];
}
