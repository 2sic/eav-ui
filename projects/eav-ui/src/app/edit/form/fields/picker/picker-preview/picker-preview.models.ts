import { WIPDataSourceItem } from 'projects/edit-types';
import { ControlStatus } from '../../../../shared/models';

export interface EntityPickerPreviewTemplateVars {
  selectedItems: WIPDataSourceItem[];
  freeTextMode: boolean;
  enableTextEntry: boolean;
  controlStatus: ControlStatus<string | string[]>;
  disableAddNew: boolean;

  leavePlaceForButtons: boolean;
  showAddNewEntityButton: boolean;
  showGoToListDialogButton: boolean;
}
