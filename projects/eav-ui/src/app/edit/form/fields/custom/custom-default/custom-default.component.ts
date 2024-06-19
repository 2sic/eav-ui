import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';

@Component({
    selector: InputTypeConstants.CustomDefault,
    templateUrl: './custom-default.component.html',
    styleUrls: ['./custom-default.component.scss'],
    standalone: true,
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class CustomDefaultComponent extends BaseFieldComponent<null> implements OnInit, OnDestroy {

  constructor() {
    super();
  }
}
