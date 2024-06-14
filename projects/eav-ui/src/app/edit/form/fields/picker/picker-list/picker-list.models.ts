import { PickerItem } from 'projects/edit-types';

export interface EntityListViewModel {
  allowMultiValue: boolean;
  enableEdit: boolean;
  enableDelete: boolean;
  enableRemove: boolean;
  selectedItems: PickerItem[];
  required: boolean;

  csDisabled: boolean;
}

export interface ReorderIndexes {
  previousIndex: number;
  currentIndex: number;
}
