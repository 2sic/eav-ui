import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-default',
  templateUrl: './string-default.component.html',
  styleUrls: ['./string-default.component.css'],
})
@InputType({
  wrapper: ['app-field-parent-wrapper', 'app-field-wrapper'],
})
export class StringDefaultComponent implements Field, OnInit {
  @Input() config: FieldConfig;
  group: FormGroup;

  constructor() {
    // console.log('ime pisem u decorator: ', this['wrapper']());
  }

  ngOnInit() {
  }
  // get type() {
  //   return this.to.type || 'text';
  // }

  // get rowCount() {
  //   return this.to.rowCount || 1;
  // }
}
