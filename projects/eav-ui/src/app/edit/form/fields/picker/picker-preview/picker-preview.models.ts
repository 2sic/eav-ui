import { PickerItem } from 'projects/edit-types';

export interface EntityPickerPreviewViewModel {
  selectedItems: PickerItem[];
  freeTextMode: boolean;
  enableTextEntry: boolean;
  disableAddNew: boolean;

  leavePlaceForButtons: boolean;
  showAddNewEntityButton: boolean;
  showGoToListDialogButton: boolean;
  csDisabled: boolean;
}
