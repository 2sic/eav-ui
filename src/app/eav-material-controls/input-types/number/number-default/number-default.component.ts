import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'number-default',
  templateUrl: './number-default.component.html',
  styleUrls: ['./number-default.component.css']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class NumberDefaultComponent implements Field, OnInit {
  config: FieldConfig;
  group: FormGroup;

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  get max() {
    return this.config.settings.Max;
  }

  get min() {
    return this.config.settings.Min;
  }

  getErrorMessage() {
    return this.validationMessagesService.getErrorMessage(this.group.controls[this.config.name], this.config);
  }

  constructor(private validationMessagesService: ValidationMessagesService) { }

  ngOnInit(): void {


    // this.decimal = this.config.settings.Decimals ? `^[0-9]+(\.[0-9]{1,${this.config.settings.Decimals}})?$` : null;

  }

}
