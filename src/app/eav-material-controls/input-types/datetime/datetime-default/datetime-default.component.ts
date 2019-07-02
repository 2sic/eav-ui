import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'datetime-default',
  templateUrl: './datetime-default.component.html',
  styleUrls: ['./datetime-default.component.scss']
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class DatetimeDefaultComponent implements Field {
  config: FieldConfigSet;
  group: FormGroup;

  constructor(private validationMessagesService: ValidationMessagesService) { }

  get inputInvalid() {
    return this.group.controls[this.config.field.name].invalid;
  }

  get disabled() {
    return this.group.controls[this.config.field.name].disabled;
  }
}
