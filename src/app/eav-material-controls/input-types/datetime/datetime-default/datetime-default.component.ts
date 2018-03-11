import { Component, OnInit, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'datetime-default',
  templateUrl: './datetime-default.component.html',
  styleUrls: ['./datetime-default.component.css']
})
@InputType({
  wrapper: ['app-field-wrapper'],
})
export class DatetimeDefaultComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
  // @ViewChild(MatInput) matInput: MatInput;
  // errorStateMatcher = new FormlyErrorStateMatcher(this);
}
