import { PickerItem } from 'projects/edit-types';
import { ControlStatus } from '../../../../shared/models/control-status.model';

export interface EntityListViewModel {
  allowMultiValue: boolean;
  enableEdit: boolean;
  enableDelete: boolean;
  enableRemove: boolean;
  selectedItems: PickerItem[];
  label: string;
  required: boolean;
  controlStatus: ControlStatus<string | string[]>;
}

export interface ReorderIndexes {
  previousIndex: number;
  currentIndex: number;
}
