import { PickerItem } from 'projects/edit-types';
import { ControlStatus } from '../../../../shared/models';

export interface PickerSearchViewModel {
  options: PickerItem[];
  controlStatus: ControlStatus<string | string[]>;
  required: boolean;
  filteredItems: PickerItem[];

  isDisabled: boolean;
}
