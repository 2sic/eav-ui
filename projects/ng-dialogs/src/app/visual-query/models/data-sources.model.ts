export interface DataSource {
  ContentType: string;
  Difficulty: number;
  DynamicOut: boolean;
  EnableConfig: boolean;
  HelpLink: string;
  Icon: string;
  In: string[];
  Name: string;
  Out: string[];
  PartAssemblyAndType: string;
  PrimaryType: string;
  UiHint: string;
}

export interface SortedDataSources {
  [key: string]: DataSource[];
}

export interface DataSourceMetadata {
  Guid: string;
  Id: number;
  Title: string;
  TypeName: string;
}
