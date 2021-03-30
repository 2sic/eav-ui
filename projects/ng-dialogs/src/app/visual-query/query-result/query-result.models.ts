import { DebugStreamInfo, PipelineResult } from '../models';

export interface QueryResultDialogData {
  result: PipelineResult;
  debugStream?: DebugStreamInfo;
  top: number;
}
