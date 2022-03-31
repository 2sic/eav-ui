import { JsonComments, JsonSchema } from '../../../../../ng-dialogs/src/app/monaco-editor';
import { ControlStatus } from '../../../../shared/models';
import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface CustomJsonEditorTemplateVars extends BaseFieldTemplateVars {
  controlStatus: ControlStatus<string>;
  focused: boolean;
  rowCount: number;
  editorHeight: string;
  jsonSchema: JsonSchema;
  jsonComments: JsonComments;
}
