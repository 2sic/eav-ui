export interface DataSourceInstance {
  ContentType: string;
  Difficulty: number;
  DynamicIn: boolean;
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

  OutMode: 'dynamic' | 'static' | 'mirror-in';
}
