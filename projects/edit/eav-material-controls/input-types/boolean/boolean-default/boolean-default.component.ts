import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'boolean-default',
  templateUrl: './boolean-default.component.html',
  styleUrls: ['./boolean-default.component.scss']
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class BooleanDefaultComponent implements Field {
  config: FieldConfigSet;
  group: FormGroup;

  get disabled() {
    return this.group.controls[this.config.field.name].disabled;
  }

  get label() {
    const value = this.group.controls[this.config.field.name].value;
    if (value === true && this.config.field.settings.TitleTrue != null && this.config.field.settings.TitleTrue !== '') {
      return this.config.field.settings.TitleTrue;
    }
    if (value === false && this.config.field.settings.TitleFalse != null && this.config.field.settings.TitleFalse !== '') {
      return this.config.field.settings.TitleFalse;
    }
    return this.config.field.label;
  }

}
