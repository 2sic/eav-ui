import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { ValidationMessagesService } from '../../validators/validation-messages-service';

@Component({
  selector: 'app-field-helper-text',
  templateUrl: './field-helper-text.component.html',
  styleUrls: ['./field-helper-text.component.scss']
})
export class FieldHelperTextComponent implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  @Input() disableError = false;

  isFullText = false;
  control: AbstractControl;
  description: string;

  private subscription = new Subscription();

  get errorMessage() { return this.validationMessagesService.getErrorMessage(this.control, this.config); }

  constructor(private validationMessagesService: ValidationMessagesService) { }

  ngOnInit() {
    this.control = this.group.controls[this.config.field.name];
    this.subscription.add(this.config.field.settings$.subscribe(settings => {
      this.description = settings.Notes;
    }));
  }

  /** spm Don't toggle if clicked on an anchor tag or it's children */
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
