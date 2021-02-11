import { Injectable, OnDestroy } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { ObjectModel } from '../../shared/models/object.model';

@Injectable()
export class ValidationMessagesService implements OnDestroy {
  /** Fires on field validation touch to display validation messages */
  showValidation$ = new Subject<AbstractControl>();

  private validationMessages: ObjectModel<(config: FieldConfigSet) => string> = {
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
    this.showValidation$.complete();
  }

  /** Marks controls as touched to show errors beneath controls and collects error messages */
  validateForm(form: FormGroup): ObjectModel<string> {
    const errors: ObjectModel<string> = {};
    for (const [controlKey, control] of Object.entries(form.controls)) {
      control.markAsTouched({ onlySelf: true });
      this.showValidation$.next(control);

      if (!control.invalid) { continue; }

      for (const errorKey of Object.keys(control.errors)) {
        errors[controlKey] = this.validationMessages[errorKey]?.(undefined);
        if (errors[controlKey]) { break; }
      }
    }
    return errors;
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
