import { JsonSchema } from '../../../../../ng-dialogs/src/app/monaco-editor';
import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface CustomJsonEditorTemplateVars extends BaseFieldTemplateVars {
  focused: boolean;
  rowCount: number;
  editorHeight: string;
  jsonSchema: JsonSchema;
}
