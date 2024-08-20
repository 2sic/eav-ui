import { Component, inject } from '@angular/core';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldState } from '../../field-state';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';

@Component({
  selector: InputTypeConstants.CustomDefault,
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
