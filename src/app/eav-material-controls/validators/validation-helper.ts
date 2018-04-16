import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { EavAttributesTranslated } from '../../shared/models/eav';

export class ValidationHelper {

    /**
    * TODO: see can i write this in module configuration ???
    * @param inputType
    */
    public static setDefaultValidations(settings: EavAttributesTranslated): ValidatorFn[] {

        const validation: ValidatorFn[] = [];

        const required = settings.Required ? settings.Required : false;
        if (required) {
            validation.push(Validators.required);
        }
        const pattern = settings.ValidationRegex ? settings.ValidationRegex : '';
        if (pattern) {
            validation.push(Validators.pattern(pattern));
        }

        // TODO: See do we set this here or in control
        const max = settings.Max ? settings.Max : 0;
        if (max > 0) {
            validation.push(Validators.max(max));
        }

        // TODO: See do we set this here or in control
        const min = settings.Min ? settings.Min : 0;
        if (min > 0) {
            validation.push(Validators.min(min));
        }

        // if (inputType === InputTypesConstants.stringUrlPath) {
        //   validation = [...['onlySimpleUrlChars']];
        // }

        return validation;
    }
}
