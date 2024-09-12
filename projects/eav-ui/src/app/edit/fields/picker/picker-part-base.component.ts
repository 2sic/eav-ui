import { Component, inject } from '@angular/core';
import { FieldState } from '../../fields/field-state';
import { classLog } from '../../../shared/logging';

/**
 * Base class for Picker Part Components.
 */
@Component({
  selector: 'app-picker-part-base',
  template: '',
})
export class PickerPartBaseComponent {
  
  log = classLog({PickerPartBaseComponent});

  /** Entire Field State */
  fieldState = inject(FieldState);

  /** Picker Data Bundle with Source and state etc. */
  pickerData = this.fieldState.pickerData;

  public controlStatus = this.pickerData.state.controlStatus;

  /** All Selected Items */
  public selectedItems = this.pickerData.selectedAll;

  /** Field Configuration - from field state */
  config = this.fieldState.config;

  /** Label and other basics to show from the picker data. Is not auto-attached, since it's not the initial/top-level component. */
  basics = this.pickerData.state.basics;

  /** Features */
  features = this.pickerData.features;

  constructor() { }
}
