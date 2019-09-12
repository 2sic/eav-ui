import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-default',
  templateUrl: './string-default.component.html',
  styleUrls: ['./string-default.component.scss']
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class StringDefaultComponent implements Field, OnInit {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  rowCount: number;

  constructor() { }

  ngOnInit() {
    this.rowCount = this.config.field.settings.RowCount ? this.config.field.settings.RowCount : 1;
  }
}
