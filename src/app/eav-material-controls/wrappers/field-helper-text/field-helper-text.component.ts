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
  // @Input() hasDirtyTouched = true;
  @Input() disableError = false;

  isFullText = false;

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  get disabled() {
    return this.group.controls[this.config.name].disabled;
  }

  getErrorMessage() {
    return this.validationMessagesService.getErrorMessage(this.group.controls[this.config.name], this.config);
  }

  constructor(private validationMessagesService: ValidationMessagesService) { }

  ngOnInit() {
  }
}
