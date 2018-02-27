import { Component, OnInit, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { MatInput } from '@angular/material/input';
import { FormlyErrorStateMatcher } from '../../formly.error-state-matcher';
import { Field } from '../../../../eav-dynamic-form/model/field.interface';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config.interface';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-string-default',
  templateUrl: './string-default.component.html',
  styleUrls: ['./string-default.component.css']
})
export class StringDefaultComponent implements Field, OnInit {
  config: FieldConfig;
  group: FormGroup;
  // @ViewChild(MatInput) matInput: MatInput;
  // errorStateMatcher = new FormlyErrorStateMatcher(this);

  ngOnInit() {
  }
  // get type() {
  //   return this.to.type || 'text';
  // }

  // get rowCount() {
  //   return this.to.rowCount || 1;
  // }

}
