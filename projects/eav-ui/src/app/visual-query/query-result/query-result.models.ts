import { DebugStreamInfo } from '../models/debug-stream-info.model';
import { QueryResult } from '../models/result/pipeline-result';

export interface QueryResultDialogData {
  result: QueryResult;
  debugStream?: DebugStreamInfo;
  top: number;
}
