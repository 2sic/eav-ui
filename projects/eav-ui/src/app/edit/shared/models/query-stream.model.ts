import { EntityBasic } from './entity-basic';

// TODO: @2dg - also move to shared/models since it's used outside of edit

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
