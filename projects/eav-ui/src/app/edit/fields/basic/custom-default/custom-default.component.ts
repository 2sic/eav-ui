import { Component, inject } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldState } from '../../field-state';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';

@Component({
  selector: InputTypeCatalog.CustomDefault,
  templateUrl: './custom-default.component.html',
  styleUrls: ['./custom-default.component.scss'],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class CustomDefaultComponent {

  protected fieldState = inject(FieldState);
  protected config = this.fieldState.config;

  constructor() {
  }
}
