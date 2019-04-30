import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-template-picker',
  templateUrl: './string-template-picker.component.html',
  styleUrls: ['./string-template-picker.component.scss']
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class StringTemplatePickerComponent implements OnInit {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  constructor() {
    console.log('StringTemplatePickerComponent constructor called');
  }

  ngOnInit() {
    console.log('StringTemplatePickerComponent ngOnInit called', this.config, this.group);
  }

}
