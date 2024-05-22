import { EntityBasic } from './entity-basic';

export interface QueryStreams {
  /**
   * The default stream
   */
  Default: EntityBasic[];

  /**
   * Optional other streams
   */
  [stream: string]: EntityBasic[];
}
