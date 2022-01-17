import { ICellRendererParams } from '@ag-grid-community/core';
import { SiteLanguage } from '../../models/site-language.model';

export interface SiteLanguagesStatusParams extends ICellRendererParams {
  onEnabledToggle(language: SiteLanguage): void;
}
