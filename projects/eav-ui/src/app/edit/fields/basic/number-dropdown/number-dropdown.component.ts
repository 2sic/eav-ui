import { Component } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldMetadata } from '../../field-metadata.decorator';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { NumberDropdownLogic } from './number-dropdown-logic';

@Component({
    selector: InputTypeCatalog.NumberDropdown,
    templateUrl: '../../picker/picker.component.html',
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
    // EntityDefaultLogic.importMe();
  }
}
