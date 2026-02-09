import { DebugStreamInfo } from '../models/debug-stream-info.model';
import { PipelineResult } from '../models/pipeline-result.model';

export interface QueryResultDialogData {
  result: PipelineResult;
  debugStream?: DebugStreamInfo;
  top: number;
}
