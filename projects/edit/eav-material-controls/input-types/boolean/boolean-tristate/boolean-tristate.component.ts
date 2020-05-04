import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'boolean-tristate',
  templateUrl: './boolean-tristate.component.html',
  styleUrls: ['./boolean-tristate.component.scss']
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class BooleanTristateComponent implements Field {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  get disabled() {
    return this.group.controls[this.config.field.name].disabled;
  }

  get checked() {
    const value = this.group.controls[this.config.field.name].value;
    this.value = (value === '') ? null : value;
    return this.value;
  }

  value: boolean;

  toggle() {
    switch (this.value) {
      case false:
        this.value = null;
        break;
      case null:
        this.value = true;
        break;
      case true:
        this.value = false;
        break;
    }
    this.group.controls[this.config.field.name].patchValue(this.value);
  }

}
