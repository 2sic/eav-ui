import { SiteLanguage } from '../../models/site-language.model';

export interface SiteLanguagesStatusParams {
  onToggleLanguage(language: SiteLanguage, enable: boolean): void;
}
