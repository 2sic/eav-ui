import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { FieldSettings } from '../../../../../../edit-types';
import { InputTypeConstants, InputTypeStrict } from '../../../content-type-fields/constants/input-type.constants';
import { AdamControl } from '../../form/fields/hyperlink/hyperlink-library/hyperlink-library.models';
import { SxcAbstractControl } from '../models';
import { FieldsSettingsService } from '../services';
import { ItemFieldVisibility } from '../services/item-field-visibility';
import { convertValueToArray } from '../../form/fields/picker/picker.helpers';

/** Validators here are copied from https://github.com/angular/angular/blob/master/packages/forms/src/validators.ts */
export class ValidationHelpers {

  static isRequired(settings: FieldSettings): boolean {
    // hidden field can't be required
    return this.ignoreValidators(settings) ? false : settings.Required;
  }

  static getValidators(fieldName: string, inputType: InputTypeStrict, fieldsSettingsService: FieldsSettingsService): ValidatorFn[] {
    // TODO: merge all validators in a single function? Should be faster
    const validators: ValidatorFn[] = [
      inputType !== InputTypeConstants.HyperlinkLibrary
        ? this.required(fieldName, fieldsSettingsService)
        : this.requiredAdam(fieldName, fieldsSettingsService),
      this.pattern(fieldName, fieldsSettingsService),
      this.decimals(fieldName, fieldsSettingsService),
      this.min(fieldName, fieldsSettingsService),
      this.max(fieldName, fieldsSettingsService),
      this.minNoItems(fieldName, fieldsSettingsService),
      this.maxNoItems(fieldName, fieldsSettingsService),
      this.formulaValidate(fieldName, fieldsSettingsService),
    ];
    if (inputType === InputTypeConstants.CustomJsonEditor) {
      validators.push(this.validJson(fieldName, fieldsSettingsService));
    }
    return validators;
  }

  /**
   * Validations run when controls are created, but only for fields which are not disabled,
   * and it can be too late to attach warning after field creation
   */
  static ensureWarning(control: SxcAbstractControl): void {
    if (control._warning$ == null) {
      control._warning$ = new BehaviorSubject<ValidationErrors>(null);
    }
  }

  private static required(fieldName: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = fieldsSettingsService.getFieldSettings(fieldName);
      if (this.ignoreValidators(settings)) return null;
      if (!settings._currentRequired) return null;

      return Validators.required(control);
    };
  }

  private static requiredAdam(fieldName: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = fieldsSettingsService.getFieldSettings(fieldName);
      if (this.ignoreValidators(settings)) return null;
      if (!settings._currentRequired) return null;

      return (control as AdamControl).adamItems === 0 ? { required: true } : null;
    };
  }

  private static pattern(fieldName: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = fieldsSettingsService.getFieldSettings(fieldName);
      if (this.ignoreValidators(settings)) return null;
      if (!settings.ValidationRegExJavaScript) return null;

      return Validators.pattern(settings.ValidationRegExJavaScript)(control);
    };
  }

  private static decimals(fieldName: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = fieldsSettingsService.getFieldSettings(fieldName);
      if (this.ignoreValidators(settings)) return null;
      if (settings.Decimals == null || settings.Decimals < 0) return null;
      if (control.value == null) return null;

      const matchString = settings.Decimals === 0 ? `^-?[0-9]+$` : `^-?[0-9]+(\.[0-9]{1,${settings.Decimals}})?$`;
      const matches = (control.value as number).toString().match(matchString);
      return !matches ? { decimals: true } : null;
    };
  }

  private static min(fieldName: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = fieldsSettingsService.getFieldSettings(fieldName);
      if (this.ignoreValidators(settings)) return null;
      if (settings.Min == null) return null;

      return Validators.min(settings.Min)(control);
    };
  }

  private static max(fieldName: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = fieldsSettingsService.getFieldSettings(fieldName);
      if (this.ignoreValidators(settings)) return null;
      if (settings.Max == null) return null;

      return Validators.max(settings.Max)(control);
    };
  }

  private static minNoItems(fieldName: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = fieldsSettingsService.getFieldSettings(fieldName);
      if (this.ignoreValidators(settings)) return null;
      if (settings.AllowMultiMin == 0 || settings.AllowMultiMin == undefined) return null;

      const lessThanMin = (Array.isArray(control.value)
        ? control.value.length
        : convertValueToArray(control.value, settings.Separator, settings._options).length)
          < settings.AllowMultiMin
      return lessThanMin ? { minNoItems: settings.AllowMultiMin } : null;
    };
  }

  private static maxNoItems(fieldName: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = fieldsSettingsService.getFieldSettings(fieldName);
      if (this.ignoreValidators(settings)) return null;
      if (settings.AllowMultiMax == 0 || settings.AllowMultiMax == undefined) return null;

      const moreThanMax = (Array.isArray(control.value)
        ? control.value.length
        : convertValueToArray(control.value, settings.Separator, settings._options).length)
        > settings.AllowMultiMax
      return moreThanMax ? { maxNoItems: settings.AllowMultiMax } : null;
    };
  }

  private static validJson(fieldName: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn {
    return (control: SxcAbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = fieldsSettingsService.getFieldSettings(fieldName);
      let error: boolean;
      let warning: boolean;

      if (this.ignoreValidators(settings) || settings.JsonValidation === 'none' || !control.value) {
        error = false;
        warning = false;
      } else {
        try {
          JSON.parse(control.value);
          error = false;
          warning = false;
        } catch {
          if (settings.JsonValidation === 'strict') {
            error = true;
            warning = false;
          } else if (settings.JsonValidation === 'light') {
            error = false;
            warning = true;
          }
        }
      }

      control._warning$.next(warning ? { jsonWarning: true } : null);
      return error ? { jsonError: true } : null;
    };
  }

  private static formulaValidate(fieldName: string, fieldsSettingsService: FieldsSettingsService): ValidatorFn {
    return (control: SxcAbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const fieldProps = fieldsSettingsService.getFieldsProps()[fieldName];
      const settings = fieldProps.settings;
      const formulaValidation = fieldProps.formulaValidation;
      let error: boolean;
      let warning: boolean;

      if (this.ignoreValidators(settings) || formulaValidation == null) {
        error = false;
        warning = false;
      } else {
        if (formulaValidation.severity === 'error') {
          error = true;
          warning = false;
        } else if (formulaValidation.severity === 'warning') {
          error = false;
          warning = true;
        } else {
          error = false;
          warning = false;
        }
      }

      control._warning$.next(warning ? { formulaWarning: true, formulaMessage: formulaValidation.message } : null);
      return error ? { formulaError: true, formulaMessage: formulaValidation.message } : null;
    };
  }

  /** Hidden fields can't have validators */
  private static ignoreValidators(settings: FieldSettings): boolean {
    return !ItemFieldVisibility.mergedVisible(settings);
  }
}
