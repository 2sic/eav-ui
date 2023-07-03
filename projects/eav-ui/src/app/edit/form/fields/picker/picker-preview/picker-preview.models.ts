import { ControlStatus } from '../../../../shared/models';
import { SelectedEntity } from '../../entity/entity-default/entity-default.models';

export interface EntityPickerPreviewTemplateVars {
  selectedEntities: SelectedEntity[];
  freeTextMode: boolean;
  enableTextEntry: boolean;
  controlStatus: ControlStatus<string | string[]>;
  disableAddNew: boolean;

  leavePlaceForButtons: boolean;
  showAddNewEntityButton: boolean;
  showGoToListDialogButton: boolean;
}
