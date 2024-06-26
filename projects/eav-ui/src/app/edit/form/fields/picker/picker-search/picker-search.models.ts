import { PickerItem } from 'projects/edit-types';
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
  selectedItems: PickerItem[];
  options: PickerItem[];
  error: string;
  controlStatus: ControlStatus<string | string[]>;
  freeTextMode: boolean;
  label: string;
  required: boolean;
  selectedItem: PickerItem;
  filteredItems: PickerItem[];

  isTreeDisplayMode: boolean;
  isDisabled: boolean;
}
