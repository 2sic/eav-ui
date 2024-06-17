import { Component, OnDestroy, computed, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseComponent } from 'projects/eav-ui/src/app/shared/components/base.component';
import { PickerData } from './picker-data';
import { FieldConfigSet, FieldControlConfig } from '../../builder/fields-builder/field-config-set.model';
import { FieldControlWithSignals } from '../../builder/fields-builder/field.model';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = true;
const nameOfThis = 'PickerPartBaseComponent';

/**
 * Base class for Picker Part Components.
 */
@Component({
  selector: 'app-picker-part-base',
  template: '',
})
export class PickerPartBaseComponent extends BaseComponent implements OnDestroy, FieldControlWithSignals {

  /** Picker Data Bundle with Source and state etc. */
  pickerData = input.required<PickerData>();

  /** Field Configuration */
  config = input.required<FieldConfigSet>();

  /** Form Group */
  group = input.required<FormGroup>();

  /** Field Control Configuration - mainly isPreview state */
  controlConfig = input.required<FieldControlConfig>();

  public controlStatus = computed(() => this.pickerData().state.controlStatus());

  /** All Selected Items */
  public selectedItems = computed(() => this.pickerData().selectedItemsSig());

  /** Label and other basics to show from the picker data. Is not auto-attached, since it's not the initial/top-level component. */
  basics = computed(() => this.pickerData().state.basics());

  constructor(log?: EavLogger) {
    super(log ?? new EavLogger(nameOfThis, logThis));
  }
}
