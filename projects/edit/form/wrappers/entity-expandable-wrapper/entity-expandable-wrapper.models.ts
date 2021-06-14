import { BaseFieldTemplateVars } from '../../fields/base/base-field-template-vars.model';
import { SelectedEntity } from '../../fields/entity/entity-default/entity-default.models';

export interface EntityExpandableTemplateVars extends BaseFieldTemplateVars {
  selectedEntities: SelectedEntity[];
  entitiesNumber: number;
}
