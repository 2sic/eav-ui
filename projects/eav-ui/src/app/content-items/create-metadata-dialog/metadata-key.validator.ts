import { AbstractControl, UntypedFormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Of } from '../../../../../core';
import { eavConstants, MetadataKeyTypes } from '../../shared/constants/eav.constants';
import { guidRegex } from '../../shared/constants/guid.constants';

export function metadataKeyValidator(form: UntypedFormGroup): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) { return null; }

    const keyType: Of<typeof MetadataKeyTypes> = form.controls['keyType'].value;
    const testValue = (control.value as string | number).toString();

    switch (keyType) {
      case eavConstants.keyTypes.number:
        const isWholeNumber = /^[0-9]+$/.test(testValue);
        return !isWholeNumber ? { patternWholeNumber: true } : null;
      case eavConstants.keyTypes.guid:
        // allow curly brackets around guid
        const hasCurly = ['{', '}'].some(bracket => testValue.includes(bracket));
        const guid = testValue.substring(
          hasCurly ? 1 : 0,
          hasCurly ? testValue.length - 1 : testValue.length,
        );
        const isGuid = guidRegex().test(guid);
        return !isGuid ? { patternGuid: true } : null;
      case eavConstants.keyTypes.string:
        return null;
      default:
        return null;
    }
  };
}
