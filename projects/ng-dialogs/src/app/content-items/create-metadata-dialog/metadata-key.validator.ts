import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { EavKeyTypeKey } from '../../shared/constants/eav.constants';
import { guidRegex } from '../../shared/constants/guid.constants';

export function metadataKeyValidator(form: FormGroup): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) { return null; }

    const keyType: EavKeyTypeKey = form.controls['keyType'].value;
    const testValue = (control.value as string | number).toString();

    switch (keyType) {
      case 'number':
        const isWholeNumber = /^[0-9]+$/.test(testValue);
        return !isWholeNumber ? { patternWholeNumber: true } : null;
      case 'guid':
        // allow curly brackets around guid
        const hasCurly = ['{', '}'].some(bracket => testValue.includes(bracket));
        const guid = testValue.substring(
          hasCurly ? 1 : 0,
          hasCurly ? testValue.length - 1 : testValue.length,
        );
        const isGuid = guidRegex().test(guid);
        return !isGuid ? { patternGuid: true } : null;
      default:
        return null;
    }
  };
}
