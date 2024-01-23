import { PickerItem } from 'projects/edit-types';
import { ControlStatus } from '../../../../shared/models';

export interface EntityPickerPreviewViewModel {
  selectedItems: PickerItem[];
  freeTextMode: boolean;
  enableTextEntry: boolean;
  controlStatus: ControlStatus<string | string[]>;
  disableAddNew: boolean;

  entityTypes: { label: string, guid: string }[];
  leavePlaceForButtons: boolean;
  showAddNewEntityButton: boolean;
  showGoToListDialogButton: boolean;
}
