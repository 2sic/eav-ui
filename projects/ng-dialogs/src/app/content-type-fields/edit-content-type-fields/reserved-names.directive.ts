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
    if (!control.value) { return null; }

    const controlValue = (control.value as string).toLocaleLowerCase();
    const reservedName = Object.keys(this.reservedNames).find(name => name.toLocaleLowerCase() === controlValue);
    return reservedName ? { reservedNames: this.reservedNames[reservedName] } : null;
  }
}
