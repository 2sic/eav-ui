import { SiteLanguage } from '../../models/site-language.model';

export interface SiteLanguagesStatusParams {
  onEnabledToggle(language: SiteLanguage): void;
}
