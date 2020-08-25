import { PipelineDataSource, Pipeline } from './pipeline.model';
import { DataSource } from './data-sources.model';

export interface QueryDef {
  data: QueryDefData;
  id: number;
  readOnly: boolean;
  /** Added later. Unclear what this is for, probably to name/number new sources */
  dsCount?: number;
  /** Added later */
  _typeInfos?: QueryDefTypeInfos;
}

export interface QueryDefData {
  DataSources: PipelineDataSource[];
  InstalledDataSources: DataSource[];
  Pipeline: Pipeline;
}

export interface QueryDefTypeInfos {
  [guid: string]: TypeInfo;
}

export interface TypeInfo {
  config?: boolean;
  dynamicOut?: boolean;
  helpLink?: string;
  icon: string;
  name: string;
  notes: string;
}
