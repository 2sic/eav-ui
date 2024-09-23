import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { Field } from '../../shared/fields/field.model';

@Directive({
    selector: '[appReservedNames]',
    providers: [
      { provide: NG_VALIDATORS, useExisting: ReservedNamesValidatorDirective, multi: true },
    ],
    standalone: true,
})
export class ReservedNamesValidatorDirective implements Validator {
  @Input('appReservedNames') reservedNames: Record<string, string> = {};

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) { return null; }

    const controlValue = (control.value as string).toLocaleLowerCase();
    const reservedName = Object.keys(this.reservedNames).find(name => name.toLocaleLowerCase() === controlValue);
    return reservedName ? { reservedNames: this.reservedNames[reservedName] } : null;
  }

  static assembleReservedNames(reservedNames: Record<string, string>, fields: Field[]) {
    const existingFields: Record<string, string> = {};
    fields.forEach(field => {
      existingFields[field.StaticName] = 'Field with this name already exists';
    });
    return {
      ...reservedNames,
      ...existingFields,
    };
  }

}
