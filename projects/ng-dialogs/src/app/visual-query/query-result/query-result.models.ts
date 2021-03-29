import { DebugStreamInfo, PipelineResult } from '../models';

export interface QueryResultDialogData {
  testParameters: string;
  result: PipelineResult;
  debugStream: DebugStreamInfo;
}
