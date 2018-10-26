import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import { ValidationMessagesService } from '../../validators/validation-messages-service';

@Component({
  selector: 'app-field-helper-text',
  templateUrl: './field-helper-text.component.html',
  styleUrls: ['./field-helper-text.component.scss']
})
export class FieldHelperTextComponent implements OnInit {

  @Input() config: FieldConfig;
  @Input() group: FormGroup;
  @Input() haveDirtyTouched = true;
  @Input() disableError = false;
  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  getErrorMessage() {
    return this.validationMessagesService.getErrorMessage(this.group.controls[this.config.name], this.config);
  }


  constructor(private validationMessagesService: ValidationMessagesService) { }

  ngOnInit() {
  }

  // TODO: need to finish validation // same code in external component
  getErrorMessageWithoutDirtyTouched() {
    // console.log('trigger getErrorMessage1:', this.config.name);
    // console.log('trigger getErrorMessage:',

    let formError = '';
    const control = this.group.controls[this.config.name];
    if (control) {
      const messages = this.validationMessagesService.validationMessages();
      if (control && control.invalid) {
        // if ((control.dirty || control.touched)) {
        // if (this.externalFactory && this.externalFactory.isDirty) {
        Object.keys(control.errors).forEach(key => {
          if (messages[key]) {
            formError = messages[key](this.config);
          }
        });
        // }
        // }
      }
    }
    // console.log('control.dirty:', control.dirty);
    // console.log('control.touched:', control.touched);
    return formError;
  }
}
