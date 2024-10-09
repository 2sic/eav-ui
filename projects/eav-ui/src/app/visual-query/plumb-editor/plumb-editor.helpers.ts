import { DataSource, PipelineDataSource } from '../models';
import { GuiTypes, TypeInfo, TypeInfos } from './plumb-editor.models';

export const guiTypes: GuiTypes = {
  App: { Name: 'App', Label: 'App DataSources', Icon: 'star', UiHint: 'DataSources from the current App' },
  Cache: { Name: 'Cache', Icon: 'history', UiHint: 'Caching of data' },
  Filter: { Name: 'Filter', Icon: 'filter_list', UiHint: 'Filter data - usually returning less items than came in' },
  Logic: { Name: 'Logic', Icon: 'share', UiHint: 'Logic operations - usually choosing between different streams' },
  Lookup: { Name: 'Lookup', Icon: 'search', UiHint: 'Lookup operation - usually looking for other data based on a criteria' },
  Modify: { Name: 'Modify', Icon: 'edit_attributes', UiHint: 'Modify data - usually changing, adding or removing values' },
  Security: { Name: 'Security', Icon: 'account_circle', UiHint: 'Security - usually limit what the user sees based on his identity' },
  Sort: { Name: 'Sort', Icon: 'sort', UiHint: 'Sort the items' },
  Source: { Name: 'Source', Icon: 'cloud_upload', UiHint: 'Source of new data - usually SQL, CSV or similar' },
  Target: { Name: 'Target', Icon: 'adjust', UiHint: 'Target - usually just a destination of data' },
  Unknown: { Name: 'Unknown', Icon: 'fiber_manual_record', UiHint: 'Unknown type' },
  Debug: { Name: 'Debug', Icon: 'bug_report', UiHint: 'Debugging Tools'},
  System: { Name: 'System', Icon: 'military_tech', UiHint: 'System Data' },
};

export function calculateTypeInfos(pipelineDataSources: PipelineDataSource[], dataSources: DataSource[]) {
  const typeInfos: TypeInfos = {};

  for (const pipelineDataSource of pipelineDataSources) {
    let typeInfo: TypeInfo;
    const ds = dataSources.find(ds => ds.PartAssemblyAndType === pipelineDataSource.PartAssemblyAndType);
    if (ds) {
      typeInfo = { ...(ds.PrimaryType ? guiTypes[ds.PrimaryType] : guiTypes.Unknown) };
      if (ds.Icon != null) { typeInfo.Icon = ds.Icon; }
      if (ds.DynamicIn != null) { typeInfo.DynamicIn = ds.DynamicIn; }
      if (ds.DynamicOut != null) { typeInfo.DynamicOut = ds.DynamicOut; }
      if (ds.HelpLink != null) { typeInfo.HelpLink = ds.HelpLink; }
      if (ds.EnableConfig != null) { typeInfo.EnableConfig = ds.EnableConfig; }
      if (ds.UiHint != null) { typeInfo.UiHint = ds.UiHint; }
    }
    if (!typeInfo)
      typeInfo = { ...guiTypes.Unknown };
    typeInfos[pipelineDataSource.EntityGuid] = typeInfo;
  }

  return typeInfos;
}
