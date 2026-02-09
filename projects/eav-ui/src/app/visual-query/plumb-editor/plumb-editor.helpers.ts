import { DataSource } from '../models/data-sources.model';
import { PipelineDataSource } from '../models/pipeline.model';
import { findDefByType } from './datasource.helpers';
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
  Debug: { Name: 'Debug', Icon: 'bug_report', UiHint: 'Debugging Tools' },
  System: { Name: 'System', Icon: 'military_tech', UiHint: 'System Data' },
};

export function calculateTypeInfos(pipelineDataSources: PipelineDataSource[], dataSources: DataSource[]) {
  const typeInfos: TypeInfos = {};

  for (const pipelineDataSource of pipelineDataSources) {
    const ds = findDefByType(dataSources, pipelineDataSource.PartAssemblyAndType);
    const typeInfo: TypeInfo = (ds)
      ? {
        ...(ds.PrimaryType ? guiTypes[ds.PrimaryType] : guiTypes.Unknown),

        DynamicIn: ds.DynamicIn ?? false,
        DynamicOut: ds.OutMode != 'static',
        Icon: ds.Icon,
        UiHint: ds.UiHint,
        HelpLink: ds.HelpLink,
        outMode: ds.OutMode,
        // ...(ds.Icon ? { Icon: ds.Icon } : {}),
        // ...(ds.UiHint ? { UiHint: ds.UiHint } : {}),
        // ...(ds.OutMode != null ? { OutMode: ds.OutMode } : {}),
        // ...(ds.HelpLink != null ? { HelpLink: ds.HelpLink } : {}),
        ...(ds.EnableConfig != null ? { EnableConfig: ds.EnableConfig } : {}),
      } satisfies TypeInfo
      : {
        ...guiTypes.Unknown,
        DynamicOut: false,
        DynamicIn: false,
        outMode: 'static',
      };
      // console.log("2dm test", pipelineDataSource, ds, typeInfo);
    
    typeInfos[pipelineDataSource.EntityGuid] = typeInfo;
  }

  return typeInfos;
}
