import { QueryEntity } from './query-entity.model';


export interface QueryStreams {
  /**
   * The default stream
   */
  Default: QueryEntity[];

  /**
   * Optional other streams
   */
  [stream: string]: QueryEntity[];
}
