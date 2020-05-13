export class ContentGroup {
  id: number;
  guid: string;
  index: number;
  part: string;
}

export class ContentGroupAdd extends ContentGroup {
  add: boolean;
}
