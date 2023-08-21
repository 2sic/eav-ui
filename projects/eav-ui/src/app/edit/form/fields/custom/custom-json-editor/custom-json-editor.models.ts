import type * as Monaco from 'monaco-editor';
import { JsonSchema } from '../../../../../monaco-editor';
import { ControlStatus } from '../../../../shared/models';
import { BaseFieldViewModel } from '../../base/base-field-template-vars.model';

export interface CustomJsonEditorViewModel extends BaseFieldViewModel {
  controlStatus: ControlStatus<string>;
  focused: boolean;
  rowCount: number;
  editorHeight: string;
  jsonSchema: JsonSchema;
  jsonComments: Monaco.languages.json.SeverityLevel;
}
