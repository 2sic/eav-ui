import { PickerItem } from 'projects/edit-types';
import { ControlStatus } from '../../../../shared/models';

export interface PickerSearchViewModel {
  selectedItems: PickerItem[];
  options: PickerItem[];
  error: string;
  controlStatus: ControlStatus<string | string[]>;
  freeTextMode: boolean;
  label: string;
  required: boolean;
  filteredItems: PickerItem[];

  isDisabled: boolean;
}
