import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';

import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { ValidationMessagesService } from '../../validators/validation-messages-service';

@Component({
  selector: 'app-field-helper-text',
  templateUrl: './field-helper-text.component.html',
  styleUrls: ['./field-helper-text.component.scss']
})
export class FieldHelperTextComponent implements OnInit {

  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  // @Input() hasDirtyTouched = true;
  @Input() disableError = false;

  isFullText = false;
  control: AbstractControl;

  getErrorMessage() {
    return this.validationMessagesService.getErrorMessage(this.group.controls[this.config.field.name], this.config);
  }

  constructor(private validationMessagesService: ValidationMessagesService) { }

  ngOnInit() {
    this.control = this.group.controls[this.config.field.name];
  }

  /** spm Don't toggle if clicked on an anchor tag or it's children */
  toggleHint(event: MouseEvent) {
    let target = event.target as HTMLElement;

    if (target.tagName === 'A') { return; }
    while (target && !target.classList.contains('notes-container')) {
      target = target.parentNode as HTMLElement;
      if (!target) { return; }
      if (target.tagName === 'A') { return; }
    }

    this.isFullText = !this.isFullText;
  }
}
