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
  Configuration: Dictionary;
  Error: boolean;
  Guid: string;
  Type: string;
}

export interface PipelineResultStream {
  Count: number;
  Error: boolean;
  ErrorData: StreamErrorData;
  Source: string;
  SourceOut: string;
  Target: string;
  TargetIn: string;
}

export interface StreamErrorData {
  Created: string;
  DebugNotes: string;
  Error: string;
  Id: number;
  Message: string;
  Modified: string;
  SourceGuid: string;
  SourceLabel: string;
  SourceName: string;
  SourceStream: string;
  Title: string;
}
