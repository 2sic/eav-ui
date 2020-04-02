export class ReplaceGroup {
  SelectedId: number;
  Items: ReplaceGroupItems;
  ContentTypeName: string;
}

export class ReplaceGroupItems {
  [key: number]: string;
}
