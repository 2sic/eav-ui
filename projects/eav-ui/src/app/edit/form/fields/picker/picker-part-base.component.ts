import { Component, OnDestroy, computed, inject, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseComponent } from 'projects/eav-ui/src/app/shared/components/base.component';
import { PickerData } from './picker-data';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';
import { FieldState } from '../../builder/fields-builder/field-state';

const logThis = false;
const nameOfThis = 'PickerPartBaseComponent';

/**
 * Base class for Picker Part Components.
 */
@Component({
  selector: 'app-picker-part-base',
  template: '',
})
export class PickerPartBaseComponent extends BaseComponent implements OnDestroy {

  /** Entire Field State */
  fieldState = inject(FieldState);

  /** Picker Data Bundle with Source and state etc. */
  pickerData = input.required<PickerData>();
  
  public controlStatus = computed(() => this.pickerData().state.controlStatus());
  
  /** All Selected Items */
  public selectedItems = computed(() => this.pickerData().selectedAll());
  
  /** Field Configuration - from field state */
  config = this.fieldState.config;

  /** Label and other basics to show from the picker data. Is not auto-attached, since it's not the initial/top-level component. */
  basics = computed(() => this.pickerData().state.basics(), { equal: RxHelpers.objectsEqual });

  /** Features */
  features = computed(() => this.pickerData().features());

  constructor(log?: EavLogger) {
    super(log ?? new EavLogger(nameOfThis, logThis));
  }
}
