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
  /** This field stores JSON */
  VisualDesignerData: string;
}

export interface StreamWire {
  From: string;
  In: string;
  Out: string;
  To: string;
}
