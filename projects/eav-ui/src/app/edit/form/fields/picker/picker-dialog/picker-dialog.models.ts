import { ControlStatus } from '../../../../shared/models';

export interface EntityPickerDialogTemplateVars {
  controlStatus: ControlStatus<string | string[]>;
  freeTextMode: boolean;
  disableAddNew: boolean;

  // added for easier readability
  showAddNewEntityButtonInDialog: boolean;
}
