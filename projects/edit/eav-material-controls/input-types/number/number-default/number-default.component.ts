import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'number-default',
  templateUrl: './number-default.component.html',
  styleUrls: ['./number-default.component.scss']
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class NumberDefaultComponent implements Field, OnInit {
  config: FieldConfigSet;
  group: FormGroup;

  get inputInvalid() {
    return this.group.controls[this.config.field.name].invalid;
  }

  get max() {
    return this.config.field.settings.Max;
  }

  get min() {
    return this.config.field.settings.Min;
  }

  constructor(private validationMessagesService: ValidationMessagesService) { }

  ngOnInit(): void {
    // this.decimal = this.config.currentFieldConfig.settings.Decimals
    // ? `^[0-9]+(\.[0-9]{1,${this.config.currentFieldConfig.settings.Decimals}})?$`
    // : null;
  }

}
