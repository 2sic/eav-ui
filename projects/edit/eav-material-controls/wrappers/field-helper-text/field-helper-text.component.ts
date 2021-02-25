import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { FieldsSettingsService } from '../../../shared/services/fields-settings.service';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { FieldHelperTextTemplateVars } from './field-helper-text.models';

@Component({
  selector: 'app-field-helper-text',
  templateUrl: './field-helper-text.component.html',
  styleUrls: ['./field-helper-text.component.scss'],
})
export class FieldHelperTextComponent implements OnInit {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  @Input() disableError = false;
  @Input() hyperlinkDefaultWrapperFix = false;

  isFullText = false;
  control: AbstractControl;
  templateVars$: Observable<FieldHelperTextTemplateVars>;

  constructor(private validationMessagesService: ValidationMessagesService, private fieldsSettingsService: FieldsSettingsService) { }

  ngOnInit() {
    this.control = this.group.controls[this.config.fieldName];
    const invalid$ = this.control.statusChanges.pipe(
      map(() => this.control.invalid),
      startWith(this.control.invalid),
    );

    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName);
    const description$ = settings$.pipe(map(settings => settings.Notes));

    this.templateVars$ = combineLatest([invalid$, description$, settings$]).pipe(
      map(([invalid, description, settings]) => {
        const templateVars: FieldHelperTextTemplateVars = {
          invalid,
          description,
          settings,
        };
        return templateVars;
      }),
    );
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

  getErrorMessage() {
    return this.validationMessagesService.getErrorMessage(this.control, this.config);
  }
}
