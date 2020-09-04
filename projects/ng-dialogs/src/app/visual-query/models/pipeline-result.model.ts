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
  Configuration: { [key: string]: any };
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
