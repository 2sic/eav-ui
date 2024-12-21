import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { EntityPickerLogic } from './entity-picker-logic';

@Component({
    selector: InputTypeCatalog.EntityPicker,
    templateUrl: '../../picker/picker.component.html',
    imports: PickerImports
})
export class EntityPickerComponent extends PickerComponent implements OnInit, OnDestroy {

  log = classLog({EntityPickerComponent}, PickerComponent.logSpecs);

  constructor() {
    super();
    this.constructorEnd();
    EntityPickerLogic.importMe();
  }

}
