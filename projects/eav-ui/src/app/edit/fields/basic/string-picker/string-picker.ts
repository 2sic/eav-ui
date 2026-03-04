import { Component, OnDestroy, OnInit } from '@angular/core';
import { classLog } from '../../../../../../../shared/logging';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { PickerComponent } from '../../picker/picker';
import { PickerImports } from '../../picker/picker-providers.constant';
import { StringPickerSettingsHelper } from './string-picker-settings-helper';

@Component({
    selector: InputTypeCatalog.StringPicker,
    templateUrl: '../../picker/picker.html',
    imports: PickerImports
})
export class StringPickerComponent extends PickerComponent implements OnInit, OnDestroy {

  log = classLog({ StringPickerComponent }, PickerComponent.logSpecs);

  constructor() {
    super();
    this.constructorEnd();
    StringPickerSettingsHelper.importMe();
  }

}
