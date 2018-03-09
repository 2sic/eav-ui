import { Component, OnInit, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
// import { FormlyErrorStateMatcher } from '../../formly.error-state-matcher';
import { Field } from '../../../../eav-dynamic-form/model/field.interface';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config.interface';
import { FormGroup } from '@angular/forms';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'number-default',
  templateUrl: './number-default.component.html',
  styleUrls: ['./number-default.component.css']
})
export class NumberDefaultComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
