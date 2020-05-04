import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'custom-default',
  templateUrl: './custom-default.component.html',
  styleUrls: ['./custom-default.component.scss']
})
@InputType({
})
export class CustomDefaultComponent {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  constructor() { }

}
