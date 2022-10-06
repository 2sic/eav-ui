import { DataSource, PipelineDataSource } from '../models';
import { GuiTypes, TypeInfo, TypeInfos } from './plumb-editor.models';

export const guiTypes: GuiTypes = {
  Cache: { Name: 'Cache', Icon: 'history', UiHint: 'Caching of data' },
  Filter: { Name: 'Filter', Icon: 'filter-list', UiHint: 'Filter data - usually returning less items than came in' },
  Logic: { Name: 'Logic', Icon: 'share', UiHint: 'Logic operations - usually choosing between different streams' },
  Lookup: { Name: 'Lookup', Icon: 'search', UiHint: 'Lookup operation - usually looking for other data based on a criteria' },
  Modify: { Name: 'Modify', Icon: 'edit-attributes', UiHint: 'Modify data - usually changing, adding or removing values' },
  Security: { Name: 'Security', Icon: 'account-circle', UiHint: 'Security - usually limit what the user sees based on his identity' },
  Sort: { Name: 'Sort', Icon: 'sort', UiHint: 'Sort the items' },
  Source: { Name: 'Source', Icon: 'cloud-upload', UiHint: 'Source of new data - usually SQL, CSV or similar' },
  Target: { Name: 'Target', Icon: 'adjust', UiHint: 'Target - usually just a destination of data' },
  Unknown: { Name: 'Unknown', Icon: 'fiber-manual-record', UiHint: 'Unknown type' },
  Debug: { Name: 'Debug', Icon: 'bug-report', UiHint: 'Debugging Tools'},
  System: { Name: 'System', Icon: 'military-tech', UiHint: 'System Data' },
};

export function calculateTypeInfos(pipelineDataSources: PipelineDataSource[], dataSources: DataSource[]) {
  const typeInfos: TypeInfos = {};

  for (const pipelineDataSource of pipelineDataSources) {
    let typeInfo: TypeInfo;
    const dataSource = dataSources.find(ds => ds.PartAssemblyAndType === pipelineDataSource.PartAssemblyAndType);
    if (dataSource) {
      typeInfo = { ...(dataSource.PrimaryType ? guiTypes[dataSource.PrimaryType] : guiTypes.Unknown) };
      if (dataSource.Icon != null) { typeInfo.Icon = dataSource.Icon; }
      if (dataSource.DynamicIn != null) { typeInfo.DynamicIn = dataSource.DynamicIn; }
      if (dataSource.DynamicOut != null) { typeInfo.DynamicOut = dataSource.DynamicOut; }
      if (dataSource.HelpLink != null) { typeInfo.HelpLink = dataSource.HelpLink; }
      if (dataSource.EnableConfig != null) { typeInfo.EnableConfig = dataSource.EnableConfig; }
      if (dataSource.UiHint != null) { typeInfo.UiHint = dataSource.UiHint; }
    }
    if (!typeInfo) { typeInfo = { ...guiTypes.Unknown }; }
    typeInfos[pipelineDataSource.EntityGuid] = typeInfo;
  }

  return typeInfos;
}
