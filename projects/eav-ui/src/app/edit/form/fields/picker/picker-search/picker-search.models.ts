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
  selectedItems: WIPDataSourceItem[];
  availableItems: WIPDataSourceItem[];
  error: string;
  controlStatus: ControlStatus<string | string[]>;
  freeTextMode: boolean;
  label: string;
  required: boolean;
  selectedItem: WIPDataSourceItem;
  filteredItems: WIPDataSourceItem[];

  // added for easier readability
  showEmpty: boolean;
  hideDropdown: boolean;
  showItemEditButtons: boolean;
  isTreeDisplayMode: boolean;
}
