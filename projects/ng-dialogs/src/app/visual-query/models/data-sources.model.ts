import { Metadata } from '../../metadata';

export interface DataSource {
  ContentType: string;
  Difficulty: number;
  DynamicIn: boolean;
  DynamicOut: boolean;
  EnableConfig: boolean;
  HelpLink: string;
  Icon: string;
  In: string[];
  Name: string;
  Out: string[];
  PartAssemblyAndType: string;
  PrimaryType: string;
  TypeNameForUi: string;
  UiHint: string;
}

export interface SortedDataSources {
  [key: string]: DataSource[];
}

export interface DataSourceMetadata extends Metadata {
  [key: string]: any;
}
