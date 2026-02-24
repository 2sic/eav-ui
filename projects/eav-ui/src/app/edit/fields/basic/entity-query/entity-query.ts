import { Component, OnDestroy, OnInit } from '@angular/core';
import { classLog } from '../../../../../../../shared/logging';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { PickerComponent } from '../../picker/picker';
import { PickerImports } from '../../picker/picker-providers.constant';
import { EntityQuerySettingsHelper } from './entity-query-settings-helper';

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
    EntityQuerySettingsHelper.importMe();
  }
}
