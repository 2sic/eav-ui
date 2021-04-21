import { Injectable, OnDestroy } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { Dictionary } from '../../../ng-dialogs/src/app/shared/models/dictionary.model';
import { FieldConfigSet } from '../../eav-dynamic-form/model/field-config';

@Injectable()
export class ValidationMessagesService implements OnDestroy {
  /** Fires on field validation touch to display validation messages */
  refreshTouched$ = new Subject<AbstractControl>();
  refreshDirty$ = new Subject<AbstractControl>();

  private validationMessages: Dictionary<(config: FieldConfigSet) => string> = {
    required: (config: FieldConfigSet) => {
      return config ? 'ValidationMessage.Required' : `ValidationMessage.RequiredShort`; // short version in toaster
    },
    min: (config: FieldConfigSet) => {
      return config ? `ValidationMessage.Min` : `ValidationMessage.NotValid`;
    },
    max: (config: FieldConfigSet) => {
      return config ? `ValidationMessage.Max` : `ValidationMessage.NotValid`;
    },
    pattern: (config: FieldConfigSet) => {
      return config ? `ValidationMessage.Pattern` : `ValidationMessage.NotValid`;
    },
    decimals: (config: FieldConfigSet) => {
      return config ? `ValidationMessage.Decimals` : `ValidationMessage.NotValid`;
    },
  };

  constructor() { }

  // spm TODO: ngOnDestroy only fires in services provided in component
  ngOnDestroy(): void {
    this.refreshTouched$.complete();
    this.refreshDirty$.complete();
  }

  /** Marks controls as touched to show errors beneath controls and collects error messages */
  validateForm(form: FormGroup): Dictionary<string> {
    const errors: Dictionary<string> = {};
    for (const [controlKey, control] of Object.entries(form.controls)) {
      this.markAsTouched(control);

      if (!control.invalid) { continue; }

      for (const errorKey of Object.keys(control.errors)) {
        errors[controlKey] = this.validationMessages[errorKey]?.(undefined);
        if (errors[controlKey]) { break; }
      }
    }
    return errors;
  }

  markAsTouched(control: AbstractControl): void {
    if (control.touched) { return; }
    control.markAsTouched();
    this.refreshTouched$.next(control);
  }

  markAsDirty(control: AbstractControl): void {
    if (control.dirty) { return; }
    control.markAsDirty();
    this.refreshDirty$.next(control);
  }

  /** Calculates error message */
  getErrorMessage(control: AbstractControl, config: FieldConfigSet): string {
    let error = '';
    if (!control.invalid) { return error; }
    if (!control.dirty && !control.touched) { return error; }

    for (const errorKey of Object.keys(control.errors)) {
      error = this.validationMessages[errorKey]?.(config);
      if (error) { break; }
    }

    return error;
  }
}
