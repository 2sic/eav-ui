import { Component } from '@angular/core';
import { classLog } from 'projects/eav-ui/src/app/shared/logging';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldMetadata } from '../../field-metadata.decorator';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { StringFontIconPickerLogic } from './string-font-icon-picker-logic';

@Component({
  selector: InputTypeCatalog.StringFontIconPicker,
  templateUrl: '../../picker/picker.component.html',
  standalone: true,
  imports: [
    PickerImports,
  ],
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
