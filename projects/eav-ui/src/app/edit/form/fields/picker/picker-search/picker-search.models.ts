import { EntityInfo } from 'projects/edit-types';
import { ControlStatus } from '../../../../shared/models';
import { SelectedEntity } from '../../entity/entity-default/entity-default.models';

export interface PickerSearchViewModel {
  debugEnabled: boolean;
  allowMultiValue: boolean;
  enableCreate: boolean;
  entityType: string;
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
  disableAddNew: boolean;
  label: string;
  placeholder: string;
  required: boolean;
  tooltip: string;
  information: string;
  isDialog: boolean;
  selectedEntity: SelectedEntity;
  filteredEntities: EntityInfo[];

  // added for easier readability
  allowItemEditButtons: boolean;
  showAddNewEntityButtonInPreview: boolean;
  showGoToListDialogButton: boolean;
  showEmpty: boolean;
  hideDropdown: boolean;
  leavePlaceForButtons: boolean;
  showEmptyInputInDialog: boolean;
}
