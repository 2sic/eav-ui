import { MetadataItem } from '../../metadata';

export interface PipelineModel {
  DataSources: PipelineDataSource[];
  Pipeline: Pipeline;
}

/** DataSource definition with it's name, type, etc. */
export interface PipelineDataSource {
  Description: string;
  EntityGuid: string;
  EntityId: number;
  Metadata?: MetadataItem[];
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
  /** The data source sourceId */
  From: string;
  /** The data source source stream name */
  Out: string;
  /** The data source destinationId */
  To: string;
  /** The data source destination stream name */
  In: string;
}
