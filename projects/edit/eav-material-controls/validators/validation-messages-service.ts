import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';

import { FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

@Injectable()
export class ValidationMessagesService implements OnDestroy {
  /** Fires on field validation touch to display validation messages */
  showValidation$ = new Subject<AbstractControl>();

  constructor() { }

  ngOnDestroy() {
    this.showValidation$.complete();
  }

  /** return list of error messages */
  public validationMessages(): any {
    const messages = {
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

    return messages;
  }

  /**
   * Validate form instance
   * check_dirty true will only emit errors if the field is touched
   * check_dirty false will check all fields independent of
   * being touched or not. Use this as the last check before submitting
   */
  public validateForm(formToValidate: FormGroup, checkDirty?: boolean): any {
    const form = formToValidate;
    const formErrors: { [key: string]: any } = {};
    Object.keys(form.controls).forEach(key => {
      // for (const control in form.controls) {
      const control = form.controls[key];
      if (control) {
        // const control = form.get(field);
        const messages = this.validationMessages();
        if (control && control.invalid) {
          if (!checkDirty || (control.dirty || control.touched)) {
            Object.keys(control.errors).forEach(keyError => {
              angularConsoleLog('error key', keyError);
              formErrors[key] = formErrors[key] || messages[keyError](undefined);
            });
          }
          // this displays an error message on an invalid control
          control.markAsTouched({ onlySelf: true });
          this.showValidation$.next(control);
        }
      }
    });

    return formErrors;
  }

  /** get validation error for control */
  public getErrorMessage(control: AbstractControl, config: FieldConfigSet, touched?: boolean): string {
    let formError = '';
    if (control) {
      const messages = this.validationMessages();
      if (control && control.invalid) {
        if ((control.dirty || control.touched) || touched) {
          Object.keys(control.errors).forEach(key => {
            if (messages[key]) {
              formError = messages[key](config);
            }
          });
        }
      }
    }
    return formError;
  }
}
