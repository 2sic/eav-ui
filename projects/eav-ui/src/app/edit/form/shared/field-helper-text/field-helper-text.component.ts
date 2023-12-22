import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { combineLatest, distinctUntilChanged, map, Observable, startWith } from 'rxjs';
import { ValidationMessagesHelpers } from '../../../shared/helpers';
import { FieldsSettingsService } from '../../../shared/services';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { FieldHelperTextViewModel } from './field-helper-text.models';

@Component({
  selector: 'app-field-helper-text',
  templateUrl: './field-helper-text.component.html',
  styleUrls: ['./field-helper-text.component.scss'],
})
export class FieldHelperTextComponent implements OnInit {
  @Input() config: FieldConfigSet;
  @Input() group: UntypedFormGroup;
  @Input() disableError = false;
  @Input() hyperlinkDefaultWrapperFix = false;

  isFullText = false;
  control: AbstractControl;
  viewModel$: Observable<FieldHelperTextViewModel>;

  constructor(private fieldsSettingsService: FieldsSettingsService) { }

  ngOnInit() {
    this.control = this.group.controls[this.config.fieldName];

    const invalid$ = this.control.valueChanges.pipe(
      map(() => this.control.invalid),
      startWith(this.control.invalid),
      distinctUntilChanged(),
    );
    const disabled$ = this.control.valueChanges.pipe(
      map(() => this.control.disabled),
      startWith(this.control.disabled),
      distinctUntilChanged(),
    );
    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName);

    this.viewModel$ = combineLatest([invalid$, disabled$, settings$]).pipe(
      map(([invalid, disabled, settings]) => {
        const viewModel: FieldHelperTextViewModel = {
          invalid,
          disabled,
          description: settings.Notes,
          settings,
        };
        return viewModel;
      }),
    );
  }

  /** Don't toggle if clicked on an anchor tag or it's children */
  toggleHint(event: MouseEvent) {
    let target = event.target as HTMLElement;

    if (target.nodeName.toLocaleLowerCase() === 'a') { return; }
    while (target && target.classList && !target.classList.contains('notes-container')) {
      target = target.parentNode as HTMLElement;
      if (!target) { return; }
      if (target.nodeName.toLocaleLowerCase() === 'a') { return; }
    }

    this.isFullText = !this.isFullText;
  }

  getErrorMessage() {
    return ValidationMessagesHelpers.getErrorMessage(this.control, this.config);
  }

  getWarningMessage() {
    return ValidationMessagesHelpers.getWarningMessage(this.control);
  }
}
