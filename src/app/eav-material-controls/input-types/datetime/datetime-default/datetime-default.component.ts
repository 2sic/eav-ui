import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'datetime-default',
  templateUrl: './datetime-default.component.html',
  styleUrls: ['./datetime-default.component.scss']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class DatetimeDefaultComponent implements Field {
  config: FieldConfig;
  group: FormGroup;

  constructor(private validationMessagesService: ValidationMessagesService) { }

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  getErrorMessage() {
    return this.validationMessagesService.getErrorMessage(this.group.controls[this.config.name], this.config);
  }
}
