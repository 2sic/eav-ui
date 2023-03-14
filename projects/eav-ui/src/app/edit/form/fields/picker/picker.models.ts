import { EntityInfo } from 'projects/edit-types';
import { BaseFieldViewModel } from '../base/base-field-template-vars.model';
import { SelectedEntity } from '../entity/entity-default/entity-default.models';

export interface EntityViewModel extends BaseFieldViewModel {
  freeTextMode: boolean;
  allowMultiValue: boolean;
  selectedEntities: SelectedEntity[];
  availableEntities: EntityInfo[];
  disableAddNew: boolean;
  isExpanded: boolean;
  error: string;
}

export interface DeleteEntityProps {
  index: number;
  entityGuid: string;
}
