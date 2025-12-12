import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { EntityDefaultLogic } from './entity-default-logic';

@Component({
    selector: InputTypeCatalog.EntityDefault,
    templateUrl: '../../picker/picker.html',
    imports: PickerImports
})
export class EntityDefaultComponent extends PickerComponent implements OnInit, OnDestroy {

  log = classLog({EntityDefaultComponent}, PickerComponent.logSpecs);

  constructor() {
    super();
    this.constructorEnd();
    EntityDefaultLogic.importMe();
  }
}
