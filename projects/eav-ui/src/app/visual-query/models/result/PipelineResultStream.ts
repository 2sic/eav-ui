import { StreamErrorData } from './StreamErrorData';


export interface QueryStreamResult {
  Count: number;
  Error: boolean;
  ErrorData: StreamErrorData;
  Source: string;
  SourceOut: string;
  Target: string;
  TargetIn: string;
}
