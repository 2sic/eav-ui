import { UiPickerModeTree, WIPDataSourceItem } from 'projects/edit-types';
import { ControlStatus } from '../../../../shared/models';

export interface PickerSearchViewModel {
  debugEnabled: boolean;
  allowMultiValue: boolean;
  enableAddExisting: boolean;
  enableTextEntry: boolean;
  enableEdit: boolean;
  enableDelete: boolean;
  enableRemove: boolean;
  enableReselect: boolean;
  pickerTreeConfiguration: UiPickerModeTree;
  selectedEntities: WIPDataSourceItem[];
  availableEntities: WIPDataSourceItem[];
  error: string;
  controlStatus: ControlStatus<string | string[]>;
  freeTextMode: boolean;
  label: string;
  required: boolean;
  selectedEntity: WIPDataSourceItem;
  filteredEntities: WIPDataSourceItem[];

  // added for easier readability
  showEmpty: boolean;
  hideDropdown: boolean;
  showItemEditButtons: boolean;
  isTreeDisplayMode: boolean;
}
