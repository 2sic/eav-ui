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

  get value(): boolean {
    let value: boolean | string = this.group.controls[this.config.field.name].value;
    if (typeof value === typeof '') {
      value = (value as string).toLocaleLowerCase();
      switch (value) {
        case 'true':
          value = true;
          break;
        case 'false':
          value = false;
          break;
        case '':
          value = null;
          break;
        default:
          value = null;
      }
    }
    return value as boolean;
  }

  toggle() {
    let nextValue: boolean;
    switch (this.value) {
      case false:
        nextValue = null;
        break;
      case null:
        nextValue = true;
        break;
      case true:
        nextValue = false;
        break;
    }
    this.group.controls[this.config.field.name].patchValue(nextValue);
  }

}
