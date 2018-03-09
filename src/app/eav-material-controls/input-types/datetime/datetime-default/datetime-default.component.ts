import { Component, OnInit, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material';
import { Field } from '../../../../eav-dynamic-form/model/field.interface';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config.interface';
import { FormGroup } from '@angular/forms';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'datetime-default',
  templateUrl: './datetime-default.component.html',
  styleUrls: ['./datetime-default.component.css']
})
export class DatetimeDefaultComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
  // @ViewChild(MatInput) matInput: MatInput;
  // errorStateMatcher = new FormlyErrorStateMatcher(this);
}
