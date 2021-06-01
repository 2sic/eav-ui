import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FieldSettings } from '../../../edit-types';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldsSettingsService } from '../../shared/services';
import { AdamControl } from '../input-types/hyperlink/hyperlink-library/hyperlink-library.models';

/** Validators here are copied from https://github.com/angular/angular/blob/master/packages/forms/src/validators.ts */
export class ValidationHelper {

  static isRequired(settings: FieldSettings): boolean {
    // hidden field can't be required
    return settings.Visible ? settings.Required : false;
  }

  static getValidators(fieldName: string, inputType: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn[] {
    // TODO: merge all validators in a single function? Should be faster
    const validators: ValidatorFn[] = [
      inputType !== InputTypeConstants.HyperlinkLibrary
        ? this.required(fieldName, fieldsSettingsService)
        : this.requiredAdam(fieldName, fieldsSettingsService),
      this.pattern(fieldName, fieldsSettingsService),
      this.decimals(fieldName, fieldsSettingsService),
      this.max(fieldName, fieldsSettingsService),
      this.min(fieldName, fieldsSettingsService),
    ];
    return validators;
  }

  private static required(fieldName: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const settings = fieldsSettingsService.getFieldSettings(fieldName);
      if (this.ignoreValidators(settings)) { return null; }
      if (!settings.Required) { return null; }

      return Validators.required(control);
    };
  }

  private static requiredAdam(fieldName: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn {
    return (control: AdamControl): ValidationErrors | null => {
      const settings = fieldsSettingsService.getFieldSettings(fieldName);
      if (this.ignoreValidators(settings)) { return null; }
      if (!settings.Required) { return null; }

      return control.adamItems === 0 ? { required: true } : null;
    };
  }

  private static pattern(fieldName: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const settings = fieldsSettingsService.getFieldSettings(fieldName);
      if (this.ignoreValidators(settings)) { return null; }
      if (!settings.ValidationRegExJavaScript) { return null; }

      return Validators.pattern(settings.ValidationRegExJavaScript)(control);
    };
  }

  private static decimals(fieldName: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const settings = fieldsSettingsService.getFieldSettings(fieldName);
      if (this.ignoreValidators(settings)) { return null; }
      if (settings.Decimals == null || settings.Decimals < 0) { return null; }
      if (control.value == null) { return null; }

      const matchString = settings.Decimals === 0 ? `^-?[0-9]+$` : `^-?[0-9]+(\.[0-9]{1,${settings.Decimals}})?$`;
      const matches = (control.value as number).toString().match(matchString);
      return !matches ? { decimals: true } : null;
    };
  }

  private static max(fieldName: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const settings = fieldsSettingsService.getFieldSettings(fieldName);
      if (this.ignoreValidators(settings)) { return null; }
      if (settings.Max == null) { return null; }

      return Validators.max(settings.Max)(control);
    };
  }

  private static min(fieldName: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const settings = fieldsSettingsService.getFieldSettings(fieldName);
      if (this.ignoreValidators(settings)) { return null; }
      if (settings.Min == null) { return null; }

      return Validators.min(settings.Min)(control);
    };
  }

  /** Hidden fields can't have validators */
  private static ignoreValidators(settings: FieldSettings): boolean {
    return !settings.Visible;
  }
}
