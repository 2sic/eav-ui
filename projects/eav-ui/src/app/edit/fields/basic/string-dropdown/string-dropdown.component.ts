import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging/logging';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { EntityDefaultLogic } from '../entity-default/entity-default-logic';

@Component({
  selector: InputTypeCatalog.StringDropdown,
  templateUrl: '../../picker/picker.component.html',
  standalone: true,
  imports: PickerImports,
})
export class StringDropdownComponent extends PickerComponent implements OnInit, OnDestroy {

  log = classLog({StringDropdownComponent}, PickerComponent.logSpecs);

  constructor() {
    super();
    this.constructorEnd();
    EntityDefaultLogic.importMe();
  }

}
