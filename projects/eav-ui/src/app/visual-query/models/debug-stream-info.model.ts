import { QueryStreamResult } from './result/PipelineResultStream';

export interface DebugStreamInfo {
  name: string;
  source: string;
  sourceName: string;
  original: QueryStreamResult;
}
