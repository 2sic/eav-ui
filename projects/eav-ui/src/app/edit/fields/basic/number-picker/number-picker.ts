import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging/logging';
import { PickerComponent } from '../../picker/picker';
import { PickerImports } from '../../picker/picker-providers.constant';
import { NumberPickerSettingsHelper } from './number-picker-settings-helper';

@Component({
  selector: InputTypeCatalog.NumberPicker,
  templateUrl: '../../picker/picker.html',
  imports: PickerImports
})
export class NumberPickerComponent extends PickerComponent implements OnInit, OnDestroy {

  log = classLog({ NumberPickerComponent }, PickerComponent.logSpecs);

  constructor() {
    super();
    this.constructorEnd();
    NumberPickerSettingsHelper.importMe();
  }
}


