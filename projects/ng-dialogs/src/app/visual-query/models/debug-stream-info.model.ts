import { PipelineResultStream } from '.';

export interface DebugStreamInfo {
  name: string;
  source: string;
  sourceName: string;
  original: PipelineResultStream;
}
