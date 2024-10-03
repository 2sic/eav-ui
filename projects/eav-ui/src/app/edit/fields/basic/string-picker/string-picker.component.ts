import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { StringPickerLogic } from './string-picker-logic';

@Component({
  selector: InputTypeCatalog.StringPicker,
  templateUrl: '../../picker/picker.component.html',
  standalone: true,
  imports: PickerImports,
})
export class StringPickerComponent extends PickerComponent implements OnInit, OnDestroy {

  log = classLog({ StringPickerComponent }, PickerComponent.logSpecs);

  constructor() {
    super();
    this.constructorEnd();
    StringPickerLogic.importMe();
  }

}
