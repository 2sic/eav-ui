import { ICellRendererParams } from '@ag-grid-community/core';
import { SettingsStackItem } from '../analyze-settings.models';

export interface AnalyzeSettingsTotalResultsParams extends ICellRendererParams {
  openDetails(stackItem: SettingsStackItem): void;
}
