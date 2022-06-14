export interface SourceView {
  AppId: number;
  Code: string;
  Extension: string;
  FileName: string;
  HasApp: boolean;
  HasList: boolean;
  IsSafe: boolean;
  IsShared: boolean;
  Name: string;
  Streams: Record<string, any>;
  Type: string;
  TypeContent: string;
  TypeContentPresentation: string;
  TypeList: string;
  TypeListPresentation: string;
}
