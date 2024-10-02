import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { StringDropdownQueryLogic } from './string-dropdown-query-logic';

@Component({
  selector: InputTypeCatalog.StringDropdownQuery,
  templateUrl: '../../picker/picker.component.html',
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
