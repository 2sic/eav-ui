import { Component, OnDestroy, OnInit } from '@angular/core';
import { StringPickerLogic } from './string-picker-logic';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { EavLogger } from '../../../../shared/logging/eav-logger';

const logSpecs = {
  ...PickerComponent.logSpecs,
  enabled: true,
  name: 'StringPickerComponent',
};

@Component({
  selector: InputTypeCatalog.StringPicker,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class StringPickerComponent extends PickerComponent implements OnInit, OnDestroy {

  constructor() {
    super(new EavLogger(logSpecs));
    StringPickerLogic.importMe();
  }

}
