import { Component, OnInit, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'number-default',
  templateUrl: './number-default.component.html',
  styleUrls: ['./number-default.component.css']
})
@InputType({
  wrapper: ['app-field-wrapper'],
})
export class NumberDefaultComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
