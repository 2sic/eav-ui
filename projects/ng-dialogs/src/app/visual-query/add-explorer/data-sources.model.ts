export interface DataSource {
  ClassName: unknown;
  ContentType: string;
  Difficulty: number;
  DynamicOut: boolean;
  EnableConfig: boolean;
  HelpLink: string;
  Icon: unknown;
  In: string[];
  Name: string;
  Out: string[];
  PartAssemblyAndType: string;
  PrimaryType: string;
  allowNew: boolean;
}

export interface SortedDataSources {
  [key: string]: DataSource[];
}
