import { EntityLightIdentifier } from "../../../../../edit-types/src/EntityLight";


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
