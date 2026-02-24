import { Component } from '@angular/core';
import { classLog } from '../../../../../../../shared/logging';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { PickerComponent } from '../../picker/picker';
import { PickerImports } from '../../picker/picker-providers.constant';
import { StringDropdownQuerySettingsHelper } from './string-dropdown-query-settings-helper';

@Component({
    selector: InputTypeCatalog.StringDropdownQuery,
    templateUrl: '../../picker/picker.html',
    imports: PickerImports
})
export class StringDropdownQueryComponent extends PickerComponent {

  log = classLog({StringDropdownQueryComponent}, PickerComponent.logSpecs);

  constructor() {
    super();
    this.constructorEnd();
    StringDropdownQuerySettingsHelper.importMe();
  }
}
