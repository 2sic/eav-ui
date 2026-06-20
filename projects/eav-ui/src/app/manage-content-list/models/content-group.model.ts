export interface ContentGroup {
  id: number;
  guid: string;
  index: number;
  part: string;

  /** WIP v22 allow add-existing using a specific content-type */
  contentType?: string;
}

export interface ContentGroupAdd extends ContentGroup {
  add: boolean;
}
