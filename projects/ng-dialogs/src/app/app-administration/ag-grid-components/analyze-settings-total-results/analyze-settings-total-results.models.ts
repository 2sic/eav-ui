import { ICellRendererParams } from '@ag-grid-community/core';
import { SettingsStackItem } from '../../sub-dialogs/analyze-settings/analyze-settings.models';

export interface AnalyzeSettingsTotalResultsParams extends ICellRendererParams {
  openDetails(stackItem: SettingsStackItem): void;
}
