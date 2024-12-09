import { Directive, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { Field } from '../../shared/fields/field.model';

@Directive({
  selector: '[appReservedNames]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: ReservedNamesValidatorDirective, multi: true },
  ],
})
export class ReservedNamesValidatorDirective implements Validator {
  appReservedNames = input<Record<string, string>>({});


  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) { return null; }

    const controlValue = (control.value as string).toLocaleLowerCase();
    const reservedName = Object.keys(this.appReservedNames()).find(name => name.toLocaleLowerCase() === controlValue);
    return reservedName ? { reservedNames: this.appReservedNames()[reservedName] } : null;
  }

  static mergeReserved(reservedNames: Record<string, string>, fields: Field[]) {
    const existingFields: Record<string, string> = {};
    fields.forEach(field => {
      existingFields[field.StaticName] = 'this field already exists';
    });
    return {
      ...reservedNames,
      ...existingFields,
    };
  }

}
