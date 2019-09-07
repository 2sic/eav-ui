import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';

import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';

@Component({
  selector: 'app-field-helper-text',
  templateUrl: './field-helper-text.component.html',
  styleUrls: ['./field-helper-text.component.scss']
})
export class FieldHelperTextComponent implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  // @Input() hasDirtyTouched = true;
  @Input() disableError = false;
  private subscriptions: Subscription[] = [];

  currentLanguage$: Observable<string>;
  isFullText = false;
  control: AbstractControl;
  description: string;

  getErrorMessage() {
    return this.validationMessagesService.getErrorMessage(this.group.controls[this.config.field.name], this.config);
  }

  constructor(
    private validationMessagesService: ValidationMessagesService,
    private languageInstanceService: LanguageInstanceService,
  ) { }

  ngOnInit() {
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.config.form.formId);
    this.control = this.group.controls[this.config.field.name];
    this.description = this.config.field.settings.Notes;

    this.subscriptions.push(
      this.currentLanguage$.subscribe(currentLang => {
        this.description = this.config.field.settings.Notes;
      }),
    );
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

  changeAnchorTarget(event: MouseEvent) {
    (event.target as HTMLElement).querySelectorAll('a').forEach(anchor => anchor.target = '_blank');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }
}
