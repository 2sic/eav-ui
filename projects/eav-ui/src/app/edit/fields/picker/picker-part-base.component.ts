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

  constructor() { }

  /** Entire Field State */
  protected fieldState = inject(FieldState);

  /** Picker Data Bundle with Source and state etc. */
  protected pickerData = this.fieldState.pickerData;

  protected ui = this.fieldState.ui;

  /** All Selected Items */
  protected selectedItems = this.pickerData.selectedAll;

  /** Field Configuration - from field state */
  protected config = this.fieldState.config;

  /** Label and other basics to show from the picker data. Is not auto-attached, since it's not the initial/top-level component. */
  protected basics = this.fieldState.basics;

  /** Features */
  protected features = this.pickerData.features;
}
