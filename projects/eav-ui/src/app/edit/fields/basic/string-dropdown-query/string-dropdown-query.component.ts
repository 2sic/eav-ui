import { Component, OnDestroy, OnInit } from '@angular/core';
import { StringDropdownQueryLogic } from './string-dropdown-query-logic';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { classLog } from '../../../../shared/logging/logging';

@Component({
  selector: InputTypeCatalog.StringDropdownQuery,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class StringDropdownQueryComponent extends PickerComponent implements OnInit, OnDestroy {

  log = classLog({StringDropdownQueryComponent}, PickerComponent.logSpecs);
  
  constructor() {
    super();
    this.constructorEnd();
    StringDropdownQueryLogic.importMe();
  }
}
