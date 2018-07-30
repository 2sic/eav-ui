import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import { ValidationMessagesService } from '../../validators/validation-messages-service';

@Component({
  selector: 'app-error-wrapper',
  templateUrl: './error-wrapper.component.html',
  styleUrls: ['./error-wrapper.component.css']
})
export class ErrorWrapperComponent implements FieldWrapper {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: FieldConfig;
  group: FormGroup;

  constructor(private validationMessagesService: ValidationMessagesService) { }

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  getErrorMessage() {
    return this.validationMessagesService.getErrorMessage(this.group.controls[this.config.name], this.config);
  }
}
