import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeCatalog } from 'projects/eav-ui/src/app/shared/fields/input-type-catalog';
import { classLog } from 'projects/eav-ui/src/app/shared/logging';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { NumberPickerLogic } from './number-picker-logic';

@Component({
  selector: InputTypeCatalog.NumberPicker,
  templateUrl: '../../picker/picker.component.html',
  standalone: true,
  imports: PickerImports,
})
export class NumberPickerComponent extends PickerComponent implements OnInit, OnDestroy {

  log = classLog({ NumberPickerComponent }, PickerComponent.logSpecs);

  constructor() {
    super();
    this.constructorEnd();
    NumberPickerLogic.importMe();
  }
}


