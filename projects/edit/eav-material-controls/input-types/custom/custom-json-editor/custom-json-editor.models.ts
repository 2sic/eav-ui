import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface CustomJsonEditorTemplateVars extends BaseFieldTemplateVars {
  rowCount: number;
  placeholder: string;
  required: boolean;
  label: string;
}
