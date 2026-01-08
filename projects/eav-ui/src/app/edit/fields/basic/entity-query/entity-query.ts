import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { PickerComponent } from '../../picker/picker';
import { PickerImports } from '../../picker/picker-providers.constant';
import { EntityQueryLogic } from './entity-query-settings-helper';

@Component({
    selector: InputTypeCatalog.EntityQuery,
    templateUrl: '../../picker/picker.html',
    imports: PickerImports
})
export class EntityQueryComponent extends PickerComponent implements OnInit, OnDestroy {

  log = classLog({EntityQueryComponent}, PickerComponent.logSpecs);
  
  constructor() {
    super();
    this.constructorEnd();
    EntityQueryLogic.importMe();
  }
}
