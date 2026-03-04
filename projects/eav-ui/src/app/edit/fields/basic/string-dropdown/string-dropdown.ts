import { Component, OnDestroy, OnInit } from '@angular/core';
import { classLog } from '../../../../../../../shared/logging';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { PickerComponent } from '../../picker/picker';
import { PickerImports } from '../../picker/picker-providers.constant';
import { EntityDefaultSettingsHelper } from '../entity-default/entity-default-settings-helper';

@Component({
    selector: InputTypeCatalog.StringDropdown,
    templateUrl: '../../picker/picker.html',
    imports: PickerImports
})
export class StringDropdownComponent extends PickerComponent implements OnInit, OnDestroy {

  log = classLog({StringDropdownComponent}, PickerComponent.logSpecs);

  constructor() {
    super();
    this.constructorEnd();
    EntityDefaultSettingsHelper.importMe();
  }

}
