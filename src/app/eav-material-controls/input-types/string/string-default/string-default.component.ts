import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { MatInput } from '@angular/material/input';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field.interface';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config.interface';
// import { CustomComponentDecorator } from '../../../../eav-dynamic-form/decorators/input-type.decorator';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-default',
  templateUrl: './string-default.component.html',
  styleUrls: ['./string-default.component.css'],
  // wrapper: 'ante'
})
export class StringDefaultComponent implements Field, OnInit {
  @Input() config: FieldConfig;
  group: FormGroup;
  // @ViewChild(MatInput) matInput: MatInput;
  // errorStateMatcher = new FormlyErrorStateMatcher(this);

  ngOnInit() {
    // console.log('alo ja imam ovo component: stringdefault', this.config);
    // console.log('alo ja imam ovo component group stringdefault: ', this.group);
  }
  // get type() {
  //   return this.to.type || 'text';
  // }

  // get rowCount() {
  //   return this.to.rowCount || 1;
  // }
}
