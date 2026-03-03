import { AgGridActionsDo } from '../../../../shared/ag-grid/ag-grid-actions-signatures';
import { SettingsStackItem } from '../analyze-settings.models';

export type AnalyzeSettingsTotalResultsParams =
  AgGridActionsDo<'openDetails', SettingsStackItem>;