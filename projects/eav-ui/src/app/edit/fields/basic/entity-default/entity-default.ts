import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { PickerComponent } from '../../picker/picker';
import { PickerImports } from '../../picker/picker-providers.constant';
import { EntityDefaultLogic } from './entity-default-settings-helper';

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
