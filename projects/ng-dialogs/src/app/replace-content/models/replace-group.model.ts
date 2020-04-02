export class ReplaceConfig {
  SelectedId: number;
  Items: ReplaceConfigItems;
  ContentTypeName: string;
}

export class ReplaceConfigItems {
  [key: number]: string;
}
