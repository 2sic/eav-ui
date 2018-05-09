import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { EavAttributesTranslated } from '../../shared/models/eav';
import { CustomValidators } from './custom-validators';

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

        // const pattern = settings.ValidationRegex ? settings.ValidationRegex : '';
        // if (pattern) {
        //     validation.push(Validators.pattern(pattern));
        // }

        const pattern = settings.ValidationRegExJavaScript ? settings.ValidationRegExJavaScript : '';
        if (pattern) {
            validation.push(Validators.pattern(pattern));
        }

        // this.decimal = this.config.settings.Decimals ? `^[0-9]+(\.[0-9]{1,${this.config.settings.Decimals}})?$` : null;
        // const patternDecimals = settings.Decimals ? `^[0-9]+(\.[0-9]{1,${settings.Decimals}})?$` : '';
        // if (patternDecimals) {
        //     validation.push(Validators.pattern(patternDecimals));
        // }

        // const patternDecimals = settings.Decimals ? `^[0-9]+(\.[0-9]{1,${settings.Decimals}})?$` : '';
        if (settings.Decimals) {
            validation.push(CustomValidators.validateDecimals(settings.Decimals));
            console.log('settings validation: ', validation);
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
