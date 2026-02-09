import { PipelineResultStream } from './pipeline-result.model';

export interface DebugStreamInfo {
  name: string;
  source: string;
  sourceName: string;
  original: PipelineResultStream;
}
