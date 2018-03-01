import { Component, ViewContainerRef, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../model/field.interface';
import { FieldConfig } from '../../../model/field-config.interface';
import { TypeOption } from '../../../model/type-option.interface';

@Component({
  selector: 'app-string-default',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.css']
})
export class FormInputComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
