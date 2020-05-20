export class SourceView {
  AppId: number;
  Code: string;
  Extension: string;
  FileName: string;
  HasApp: boolean;
  HasList: boolean;
  IsSafe: boolean;
  LocationScope: string;
  Name: string;
  Streams: SourceViewStreams;
  Type: string;
  TypeContent: string;
  TypeContentPresentation: string;
  TypeList: string;
  TypeListPresentation: string;
}

export class SourceViewStreams {
  [key: string]: any;
}
