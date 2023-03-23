import { EntityInfo } from 'projects/edit-types';
import { SelectedEntity } from '../entity/entity-default/entity-default.models';

export interface PickerViewModel {
  freeTextMode: boolean;
  allowMultiValue: boolean;
  selectedEntities: SelectedEntity[];
  availableEntities: EntityInfo[];
  isExpanded: boolean;
}

export interface DeleteEntityProps {
  index: number;
  entityGuid: string;
}
