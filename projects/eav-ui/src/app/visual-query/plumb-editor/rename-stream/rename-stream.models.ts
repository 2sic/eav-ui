import { AbstractControl } from '@angular/forms';

export interface RenameStreamDialogData {
  isSource: boolean;
  label: string;
  pipelineDataSourceGuid: string;
}

export interface RenameStreamDialogControls {
  label: AbstractControl;
  scope: AbstractControl;
}

export interface RenameStreamDialogFormValue {
  label: string;
  scope: string;
}
