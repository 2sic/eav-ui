import { EntityInfo } from 'projects/edit-types';
import { ControlStatus } from '../../../../shared/models';
import { SelectedEntity } from '../../entity/entity-default/entity-default.models';

export interface PickerSearchViewModel {
  debugEnabled: boolean;
  allowMultiValue: boolean;
  enableAddExisting: boolean;
  enableTextEntry: boolean;
  enableEdit: boolean;
  enableDelete: boolean;
  enableRemove: boolean;
  selectedEntities: SelectedEntity[];
  availableEntities: EntityInfo[];
  error: string;
  controlStatus: ControlStatus<string | string[]>;
  freeTextMode: boolean;
  label: string;
  required: boolean;
  tooltip: string;
  information: string;
  selectedEntity: SelectedEntity;
  filteredEntities: EntityInfo[];

  // added for easier readability
  showEmpty: boolean;
  hideDropdown: boolean;
  showItemEditButtons: boolean;
}
