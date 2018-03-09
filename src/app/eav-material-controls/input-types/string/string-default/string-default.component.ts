import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field.interface';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config.interface';
// import { InputTypeDecorator } from './input-type.decorator';
import { InputTypeDecorator } from '../../../decorators/input-type.decorator';

// export function InputTypeDecorator(annotation: any) {
//   return function (target: Function) {
//     Object.defineProperty(target.prototype, 'wrapper', { value: () => annotation.wrapper });
//     console.log('annotation: ', annotation);
//     const metadata = new Component(annotation);
//     // console.log('metadata: ', metadata);
//     // console.log('target: ', target);
//     // Injector
//     Reflect.defineMetadata('annotations', [metadata], target);
//   };
// }

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-default',
  templateUrl: './string-default.component.html',
  styleUrls: ['./string-default.component.css'],
})
@InputTypeDecorator({
  wrapper: 'ovo je wrapper',
})
export class StringDefaultComponent implements Field, OnInit {
  @Input() config: FieldConfig;
  group: FormGroup;
  // @ViewChild(MatInput) matInput: MatInput;
  // errorStateMatcher = new FormlyErrorStateMatcher(this);
  constructor() {
    console.log('ime pisem u decorator: ', this['wrapper']());
  }

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
