export interface EntityBasic {
  Id: number;

  // 2024-04-29 2dm removed this #cleanup-picker
  // /**
  //  * The value - old, WIP
  //  * @deprecated
  //  */
  // Value: string;
  // /**
  //  * The title - old, WIP
  //  * @deprecated
  //  */
  // Text: string;

  /** The Guid, new, WIP */
  Guid: string;


  /** The title, new, WIP */
  Title: string;
}

export interface EntityBasicWithFields extends EntityBasic {
  [key: string]: any;
}