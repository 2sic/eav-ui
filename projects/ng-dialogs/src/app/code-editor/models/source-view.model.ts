import { Dictionary } from '../../shared/models/dictionary.model';

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
  Streams: Dictionary<any>;
  Type: string;
  TypeContent: string;
  TypeContentPresentation: string;
  TypeList: string;
  TypeListPresentation: string;
}
