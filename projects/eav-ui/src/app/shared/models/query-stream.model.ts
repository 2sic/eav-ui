import { EntityLightIdentifier } from "./entity-basic";


export interface QueryStreams {
  /**
   * The default stream
   */
  Default: EntityLightIdentifier[];

  /**
   * Optional other streams
   */
  [stream: string]: EntityLightIdentifier[];
}
