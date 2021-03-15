import { Dictionary } from '../../shared/models/dictionary.model';

export interface PipelineResult {
  Query: PipelineResultQuery;
  QueryTimer: PipelineResultTimer;
  Sources: PipelineResultSources;
  Streams: PipelineResultStream[];
}

export interface PipelineResultQuery {
  [endpointName: string]: PipelineResultQueryValue[];
}

export interface PipelineResultQueryValue {
  [field: string]: any;
}

export interface PipelineResultTimer {
  Milliseconds: number;
  Ticks: number;
}

export interface PipelineResultSources {
  [guid: string]: PipelineResultSourceValue;
}

export interface PipelineResultSourceValue {
  Configuration: Dictionary<any>;
  Error: boolean;
  Guid: string;
  Type: string;
}

export interface PipelineResultStream {
  Count: number;
  Error: boolean;
  Source: string;
  SourceOut: string;
  Target: string;
  TargetIn: string;
}
