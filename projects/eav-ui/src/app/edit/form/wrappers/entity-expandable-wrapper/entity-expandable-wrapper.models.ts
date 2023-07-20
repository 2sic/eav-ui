import { BaseFieldViewModel } from '../../fields/base/base-field-template-vars.model';
import { SelectedEntity } from '../../fields/entity/entity-default/entity-default.models';

export interface EntityExpandableViewModel extends BaseFieldViewModel {
  selectedEntities: SelectedEntity[];
  entitiesNumber: number;
}
