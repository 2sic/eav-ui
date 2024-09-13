import { Component, OnDestroy, OnInit } from '@angular/core';
import { StringPickerLogic } from './string-picker-logic';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { classLog } from '../../../../shared/logging/logging';

@Component({
  selector: InputTypeCatalog.StringPicker,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class StringPickerComponent extends PickerComponent implements OnInit, OnDestroy {

  log = classLog({StringPickerComponent}, PickerComponent.logSpecs);

  constructor() {
    super();
    this.constructorEnd();
    StringPickerLogic.importMe();
  }

}
