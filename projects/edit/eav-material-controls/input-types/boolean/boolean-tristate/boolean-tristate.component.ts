import { Component, EventEmitter } from '@angular/core';
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
  config: FieldConfigSet;
  group: FormGroup;

  get disabled() {
    return this.group.controls[this.config.field.name].disabled;
  }

  state: boolean = null;
  showState = false;

  nextState() {
    const newState = this.state === null
      ? false
      : this.state === false
        ? true
        : null;
    this.showState = newState === true;
    console.log('before', this.state, 'after', newState, 'show-after', this.showState);
    this.state = newState;
  }

  toggle($event: EventEmitter<void>) {
    console.log('toggle from', this.state);
    // this.nextState();
  }

}
