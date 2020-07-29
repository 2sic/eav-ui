import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { ValidationMessagesService } from '../../validators/validation-messages-service';

@Component({
  selector: 'app-field-helper-text',
  templateUrl: './field-helper-text.component.html',
  styleUrls: ['./field-helper-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldHelperTextComponent implements OnInit {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  @Input() disableError = false;

  isFullText = false;
  description$: Observable<string>;
  invalid$: Observable<boolean>;
  control: AbstractControl;

  constructor(private validationMessagesService: ValidationMessagesService) { }

  ngOnInit() {
    this.control = this.group.controls[this.config.field.name];
    this.invalid$ = this.control.statusChanges.pipe(map(status => status === 'INVALID'), startWith(this.control.invalid));
    this.description$ = this.config.field.settings$.pipe(map(settings => settings.Notes));
  }

  /** Don't toggle if clicked on an anchor tag or it's children */
  toggleHint(event: MouseEvent) {
    let target = event.target as HTMLElement;

    if (target.tagName === 'A') { return; }
    while (target && target.classList && !target.classList.contains('notes-container')) {
      target = target.parentNode as HTMLElement;
      if (!target) { return; }
      if (target.tagName === 'A') { return; }
    }

    this.isFullText = !this.isFullText;
  }

  changeAnchorTarget(event: MouseEvent) {
    (event.target as HTMLElement).querySelectorAll('a').forEach(anchor => {
      anchor.target = '_blank';
    });
  }

  getErrorMessage() {
    return this.validationMessagesService.getErrorMessage(this.control, this.config);
  }
}
