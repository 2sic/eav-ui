import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { ReservedNames } from '../models/reserved-names.model';

@Directive({
  selector: '[appReservedNames]',
  providers: [{ provide: NG_VALIDATORS, useExisting: ReservedNamesValidatorDirective, multi: true }],
})
export class ReservedNamesValidatorDirective implements Validator {
  @Input('appReservedNames') reservedNames: ReservedNames = {};

  validate(control: AbstractControl): ValidationErrors | null {
    for (const [reservedName, errorMessage] of Object.entries(this.reservedNames)) {
      if (reservedName.toLocaleLowerCase() !== control.value?.toLocaleLowerCase()) { continue; }

      return { reservedNames: errorMessage };
    }
    return null;
  }
}
