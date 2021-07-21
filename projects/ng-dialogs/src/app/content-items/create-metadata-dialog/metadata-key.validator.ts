import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function metadataKeyValidator(form: FormGroup): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const keyType: 'guid' | 'string' | 'number' = form.controls['keyType'].value;

    const mismatch =
      keyType === 'number' && typeof control.value !== 'number' ||
      keyType !== 'number' && typeof control.value !== 'string';
    return mismatch ? { mismatch: true } : null;
  };
}
