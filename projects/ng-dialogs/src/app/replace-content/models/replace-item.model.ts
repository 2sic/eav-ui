export class ReplaceItem {
  id: number;
  guid: string;
  index: number;
  part: string;
}

export class UrlReplaceItem {
  Group: UrlReplaceItemGroup;
  Title: string;
}

export class UrlReplaceItemGroup {
  Guid: string;
  Index: number;
  Part: string;
  Add: boolean;
}
