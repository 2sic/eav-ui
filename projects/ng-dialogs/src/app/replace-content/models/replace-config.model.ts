import { Dictionary } from '../../shared/models/dictionary.model';

export class ReplaceConfig {
  SelectedId: number;
  Items: Dictionary<string>;
  ContentTypeName: string;
}
