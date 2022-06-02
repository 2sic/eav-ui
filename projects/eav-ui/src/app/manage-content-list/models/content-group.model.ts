export interface ContentGroup {
  id: number;
  guid: string;
  index: number;
  part: string;
}

export interface ContentGroupAdd extends ContentGroup {
  add: boolean;
}
