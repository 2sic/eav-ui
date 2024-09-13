import { Component, OnDestroy, OnInit } from '@angular/core';
import { EntityQueryLogic } from './entity-query-logic';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { classLog } from '../../../../shared/logging/logging';

@Component({
  selector: InputTypeCatalog.EntityQuery,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class EntityQueryComponent extends PickerComponent implements OnInit, OnDestroy {

  log = classLog({EntityQueryComponent}, PickerComponent.logSpecs);
  
  constructor() {
    super();
    this.constructorEnd();
    EntityQueryLogic.importMe();
  }
}
