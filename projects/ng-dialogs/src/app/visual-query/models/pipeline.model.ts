import { DataSource } from './data-sources.model';

export interface PipelineModel {
  DataSources: PipelineDataSource[];
  Pipeline: Pipeline;
}

export interface PipelineDataSource {
  Description: string;
  EntityGuid: string;
  EntityId: number;
  Name: string;
  PartAssemblyAndType: string;
  VisualDesignerData: VisualDesignerData;
  /** Added later */
  ReadOnly?: boolean; // spm Readonly doesn't work with onPush change detection. Better move this to a separate variable
  /** Added later */
  Difficulty?: number;
  /** Added later */
  Definition?: () => DataSource;
}

export interface VisualDesignerData {
  Top: number;
  Left: number;
  Width?: number;
}

export interface Pipeline {
  AllowEdit: boolean;
  Description: string;
  EntityGuid: string;
  EntityId: number;
  Name: string;
  ParametersGroup: unknown;
  Params: string;
  StreamWiring: StreamWire[];
  StreamsOut: string;
  TestParameters: string;
}

export interface StreamWire {
  From: string;
  In: string;
  Out: string;
  To: string;
}
