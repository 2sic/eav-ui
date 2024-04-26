export interface EntityBasic {
  Id: number;
  /**
   * The value - old, WIP
   * @deprecated
   */
  Value: string;

  /** The Guid, new, WIP */
  Guid: string;

  /**
   * The title - old, WIP
   * @deprecated
   */
  Text: string;
  /** The title, new, WIP */
  Title: string;
}