import { Component, inject } from '@angular/core';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldState } from '../../field-state';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';

@Component({
  selector: InputTypeCatalog.CustomDefault,
  templateUrl: './custom-default.component.html',
  styleUrls: ['./custom-default.component.scss'],
  standalone: true,
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class CustomDefaultComponent {

  protected fieldState = inject(FieldState);
  protected config = this.fieldState.config;

  constructor() {
  }
}
