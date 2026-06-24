export interface ParentReference {
  guid: string;
  index: number;
  part: string;
}

export interface ContentGroupAdd extends ParentReference {
  id: number;
  add: boolean;
}
