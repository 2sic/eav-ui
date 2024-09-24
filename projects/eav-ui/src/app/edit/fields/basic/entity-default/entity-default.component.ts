import { Component, OnDestroy, OnInit } from '@angular/core';
import { EntityDefaultLogic } from './entity-default-logic';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { classLog } from '../../../../shared/logging/logging';

@Component({
  selector: InputTypeCatalog.EntityDefault,
  templateUrl: '../../picker/picker.component.html',
  standalone: true,
  imports: PickerImports,
})
export class EntityDefaultComponent extends PickerComponent implements OnInit, OnDestroy {

  log = classLog({EntityDefaultComponent}, PickerComponent.logSpecs);

  constructor() {
    super();
    this.constructorEnd();
    EntityDefaultLogic.importMe();
  }
}
