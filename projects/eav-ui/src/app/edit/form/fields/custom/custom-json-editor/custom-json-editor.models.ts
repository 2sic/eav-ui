import type * as Monaco from 'monaco-editor';
import { JsonSchema } from '../../../../../monaco-editor';

export interface CustomJsonEditorViewModel {
  focused: boolean;
  rowCount: number;
  editorHeight: string;
  jsonSchema: JsonSchema;
  jsonComments: Monaco.languages.json.SeverityLevel;
}
