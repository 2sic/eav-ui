import { Component, OnDestroy, OnInit } from '@angular/core';
import { classLog } from '../../../../../../../shared/logging';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { PickerComponent } from '../../picker/picker';
import { PickerImports } from '../../picker/picker-providers.constant';
import { EntityPickerSettingsHelper } from './entity-picker-settings-helper';

@Component({
    selector: InputTypeCatalog.EntityPicker,
    templateUrl: '../../picker/picker.html',
    imports: PickerImports
})
export class EntityPickerComponent extends PickerComponent implements OnInit, OnDestroy {

  log = classLog({EntityPickerComponent}, PickerComponent.logSpecs);

  constructor() {
    super();
    this.constructorEnd();
    EntityPickerSettingsHelper.importMe();
  }
}
