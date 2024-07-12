import { Component, inject } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { FieldState } from '../../../builder/fields-builder/field-state';
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
