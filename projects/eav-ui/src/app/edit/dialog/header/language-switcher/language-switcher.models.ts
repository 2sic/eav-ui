import { LanguageButton } from './language-switcher.helpers';

export interface LanguageSwitcherViewModel {
  /** current language */
  current: string;
  languageButtons: LanguageButton[];
}
