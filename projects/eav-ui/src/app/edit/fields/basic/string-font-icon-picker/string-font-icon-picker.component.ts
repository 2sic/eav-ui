import { Component } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { FieldMetadata } from '../../field-metadata.decorator';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { StringFontIconPickerLogic } from './string-font-icon-picker-logic';

@Component({
    selector: InputTypeCatalog.StringFontIconPicker,
    templateUrl: '../../picker/picker.component.html',
    imports: [
        PickerImports,
    ]
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class StringFontIconPickerComponent extends PickerComponent {

  log = classLog({StringFontIconPickerComponent}, PickerComponent.logSpecs);

  constructor() {
    super();
    this.constructorEnd();
    StringFontIconPickerLogic.importMe();
  }
}
