import { DataSource } from '../models/data-sources.model';
import { PipelineDataSource } from '../models/pipeline.model';
import { GuiTypes, TypeInfo, TypeInfos } from './plumb-editor.models';

export const guiTypes: GuiTypes = {
  Cache: { name: 'Cache', icon: 'history', notes: 'Caching of data' },
  Filter: { name: 'Filter', icon: 'filter_list', notes: 'Filter data - usually returning less items than came in' },
  Logic: { name: 'Logic', icon: 'share', notes: 'Logic operations - usually choosing between different streams' },
  Lookup: { name: 'Lookup', icon: 'search', notes: 'Lookup operation - usually looking for other data based on a criteria' },
  Modify: { name: 'Modify', icon: 'star_half', notes: 'Modify data - usually changing, adding or removing values' },
  Security: { name: 'Security', icon: 'account_circle', notes: 'Security - usually limit what the user sees based on his identity' },
  Sort: { name: 'Sort', icon: 'sort', notes: 'Sort the items' },
  Source: { name: 'Source', icon: 'cloud_upload', notes: 'Source of new data - usually SQL, CSV or similar' },
  Target: { name: 'Target', icon: 'adjust', notes: 'Target - usually just a destination of data' },
  Unknown: { name: 'Unknown', icon: 'fiber_manual_record', notes: 'Unknown type' },
};

export function calculateTypeInfos(pipelineDataSources: PipelineDataSource[], dataSources: DataSource[]) {
  const typeInfos: TypeInfos = {};

  for (const pipelineDataSource of pipelineDataSources) {
    let typeInfo: TypeInfo;
    const dataSource = dataSources.find(ds => ds.PartAssemblyAndType === pipelineDataSource.PartAssemblyAndType);
    if (dataSource) {
      typeInfo = { ...(dataSource.PrimaryType ? guiTypes[dataSource.PrimaryType] : guiTypes.Unknown) };
      if (dataSource.Icon) { typeInfo.icon = dataSource.Icon; }
      if (dataSource.DynamicOut) { typeInfo.dynamicOut = true; }
      if (dataSource.HelpLink) { typeInfo.helpLink = dataSource.HelpLink; }
      if (dataSource.EnableConfig) { typeInfo.config = dataSource.EnableConfig; }
    }
    if (!typeInfo) { typeInfo = guiTypes.Unknown; }
    typeInfos[pipelineDataSource.EntityGuid] = typeInfo;
  }

  return typeInfos;
}
