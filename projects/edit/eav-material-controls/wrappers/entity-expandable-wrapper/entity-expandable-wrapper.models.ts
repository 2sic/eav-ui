import { BaseFieldTemplateVars } from '../../input-types/base/base-field-template-vars.model';
import { SelectedEntity } from '../../input-types/entity/entity-default/entity-default.models';

export interface EntityExpandableTemplateVars extends BaseFieldTemplateVars {
  label: string;
  required: boolean;
  invalid: boolean;
  selectedEntities: SelectedEntity[];
  entitiesNumber: number;
}
