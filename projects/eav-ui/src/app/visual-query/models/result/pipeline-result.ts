import { DataSourceDefinition } from '../data-source-definition';
import { QueryStreamResult } from './PipelineResultStream';

export interface QueryResult {
  /** The data returned by the query */
  Query: QueryStreamsData;
  QueryTimer: {
    Milliseconds: number;
    Ticks: number;
  };
  Sources: Record<string, QueryResultSourceInfo>;
  Streams: QueryStreamResult[];
}

interface QueryStreamsData {
  [streamName: string]: Record<string, unknown>[];
}

interface QueryResultSourceInfo {
  Configuration: Record<string, unknown>;
  Definition?: DataSourceDefinition;
  Error: boolean;
  Guid: string;
  Out: {
    Name: string;
    Scope: string;
  }[];
  Type: string;
}
