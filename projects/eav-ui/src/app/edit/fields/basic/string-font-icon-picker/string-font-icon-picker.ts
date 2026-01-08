import { Component } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { FieldMetadata } from '../../field-metadata.decorator';
import { PickerComponent } from '../../picker/picker';
import { PickerImports } from '../../picker/picker-providers.constant';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { StringFontIconPickerSettingsHelper } from './string-font-icon-picker-settings-helper';

@Component({
    selector: InputTypeCatalog.StringFontIconPicker,
    templateUrl: '../../picker/picker.html',
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
    StringFontIconPickerSettingsHelper.importMe();
  }
}
