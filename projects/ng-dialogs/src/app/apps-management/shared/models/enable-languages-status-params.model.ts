import { ICellRendererParams } from '@ag-grid-community/core';

import { EnableLanguage } from './enable-language.model';

export interface EnableLanguagesStatusParams extends ICellRendererParams {
  onEnabledToggle(language: EnableLanguage): void;
}
