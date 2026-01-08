import { Component } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldMetadata } from '../../field-metadata.decorator';
import { PickerComponent } from '../../picker/picker';
import { PickerImports } from '../../picker/picker-providers.constant';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { NumberDropdownLogic } from './number-dropdown-settings-helper';

@Component({
  selector: InputTypeCatalog.NumberDropdown,
  templateUrl: '../../picker/picker.html',
  imports: [
    PickerImports
  ]
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class NumberDropdownComponent extends PickerComponent {

  constructor() {
    super();
    this.constructorEnd();
    NumberDropdownLogic.importMe();
  }
}
