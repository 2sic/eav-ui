import { ICellRendererParams } from '@ag-grid-community/core';
import { EnableLanguage } from '../../models/enable-language.model';

export interface EnableLanguagesStatusParams extends ICellRendererParams {
  onEnabledToggle(language: EnableLanguage): void;
}
