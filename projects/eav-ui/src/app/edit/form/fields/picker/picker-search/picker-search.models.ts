import { PickerItem } from 'projects/edit-types';
import { ControlStatus } from '../../../../shared/models';

export interface PickerSearchViewModel {
  options: PickerItem[];
  error: string;
  controlStatus: ControlStatus<string | string[]>;
  label: string;
  required: boolean;
  filteredItems: PickerItem[];

  isDisabled: boolean;
}
