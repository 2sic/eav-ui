import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hyperlink-default',
  templateUrl: './hyperlink-default.component.html',
  styleUrls: ['./hyperlink-default.component.css']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class HyperlinkDefaultComponent implements Field {
  @Input() config: FieldConfig;
  group: FormGroup;

  showPreview;
  toggleAdamValue = false;

  get value() {
    return this.group.controls[this.config.name].value;
  }

  constructor() { }

  toggleAdam(first: boolean, second: boolean) {
    console.log('toggle addam first:', first);
    console.log('toggle addam second:', second);
  }

  openPageDialog() {
    console.log('openPageDialog');
  }

}
