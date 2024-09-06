import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { FieldSettings } from '../../../../../../edit-types';
import { InputTypeCatalog, InputTypeStrict } from '../../../shared/fields/input-type-catalog';
import { ItemFieldVisibility } from '../../state/item-field-visibility';
import { AdamControl } from '../../fields/basic/hyperlink-library/hyperlink-library.models';
import { convertValueToArray } from '../../fields/picker/picker.helpers';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldProps } from '../../state/fields-configs.model';
import { Signal } from '@angular/core';


/** Slightly enhanced standard Abstract Control with additional warnings */
export interface AbstractControlPro extends AbstractControl {
  _warning$?: BehaviorSubject<ValidationErrors>;
}

/** Validators here are copied from https://github.com/angular/angular/blob/master/packages/forms/src/validators.ts */
export class ValidationHelpers {

  static isRequired(settings: FieldSettings): boolean {
    // hidden field can't be required
    return this.ignoreValidators(settings) ? false : settings.Required;
  }

  public static getValidators(specs: ValidationHelperSpecs, inputType: InputTypeStrict): ValidatorFn[] {
    // TODO: merge all validators in a single function? Should be faster
    const validators: ValidatorFn[] = [
      inputType !== InputTypeCatalog.HyperlinkLibrary
        ? this.required(specs)
        : this.requiredAdam(specs),
      this.pattern(specs),
      this.decimals(specs),
      this.min(specs),
      this.max(specs),
      this.minNoItems(specs),
      this.maxNoItems(specs),
      this.formulaValidate(specs),
    ];
    if (inputType === InputTypeCatalog.CustomJsonEditor)
      validators.push(this.validJson(specs));
    return validators;
  }

  /**
   * Validations run when controls are created, but only for fields which are not disabled,
   * and it can be too late to attach warning after field creation
   */
  public static ensureWarning(control: AbstractControlPro): void {
    if (control._warning$ == null)
      control._warning$ = new BehaviorSubject<ValidationErrors>(null);
  }

  private static required(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = specs.settings();
      if (this.ignoreValidators(settings)) return null;
      if (!settings.valueRequired) return null;
      return Validators.required(control);
    };
  }

  private static requiredAdam(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = specs.settings();
      if (this.ignoreValidators(settings)) return null;
      if (!settings.valueRequired) return null;

      return (control as AdamControl).adamItems === 0 ? { required: true } : null;
    };
  }

  private static pattern(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = specs.settings();
      if (this.ignoreValidators(settings)) return null;
      if (!settings.ValidationRegExJavaScript) return null;

      return Validators.pattern(settings.ValidationRegExJavaScript)(control);
    };
  }

  private static decimals(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = specs.settings();
      if (this.ignoreValidators(settings)) return null;
      if (settings.Decimals == null || settings.Decimals < 0) return null;
      if (control.value == null) return null;

      const matchString = settings.Decimals === 0 ? `^-?[0-9]+$` : `^-?[0-9]+(\.[0-9]{1,${settings.Decimals}})?$`;
      const matches = (control.value as number).toString().match(matchString);
      return !matches ? { decimals: true } : null;
    };
  }

  private static min(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = specs.settings();
      if (this.ignoreValidators(settings)) return null;
      if (settings.Min == null) return null;

      return Validators.min(settings.Min)(control);
    };
  }

  private static max(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = specs.settings();
      if (this.ignoreValidators(settings)) return null;
      if (settings.Max == null) return null;

      return Validators.max(settings.Max)(control);
    };
  }

  private static minNoItems(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = specs.settings();
      if (this.ignoreValidators(settings)) return null;
      if (settings.AllowMultiMin == 0 || settings.AllowMultiMin == undefined) return null;

      const lessThanMin = (Array.isArray(control.value)
        ? control.value.length
        : convertValueToArray(control.value, settings.Separator, settings._options).length)
          < settings.AllowMultiMin
      return lessThanMin ? { minNoItems: settings.AllowMultiMin } : null;
    };
  }

  private static maxNoItems(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = specs.settings();
      if (this.ignoreValidators(settings)) return null;
      if (settings.AllowMultiMax == 0 || settings.AllowMultiMax == undefined) return null;

      const moreThanMax = (Array.isArray(control.value)
        ? control.value.length
        : convertValueToArray(control.value, settings.Separator, settings._options).length)
        > settings.AllowMultiMax
      return moreThanMax ? { maxNoItems: settings.AllowMultiMax } : null;
    };
  }

  private static validJson(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControlPro): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = specs.settings();
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

  private static formulaValidate(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControlPro): ValidationErrors | null => {
      this.ensureWarning(control);
      const fieldProps = specs.fieldsSettingsService.fieldProps[specs.fieldName]();
      const formulaValidation = fieldProps.formulaValidation;

      const { error, warning } = (() => {
        if (this.ignoreValidators(specs.settings()) || formulaValidation == null)
          return {error: false, warning: false};
        if (formulaValidation.severity === 'error')
          return {error: true, warning: false};
        if (formulaValidation.severity === 'warning')
          return {error: false, warning: true};
        return {error: false, warning: false};
      })();

      control._warning$.next(warning ? { formulaWarning: true, formulaMessage: formulaValidation.message } : null);
      return error ? { formulaError: true, formulaMessage: formulaValidation.message } : null;
    };
  }

  /** Hidden fields can't have validators */
  private static ignoreValidators(settings: FieldSettings): boolean {
    return !ItemFieldVisibility.mergedVisible(settings);
  }
}

export class ValidationHelperSpecs {
  constructor(
    public fieldName: string,
    public inputType: InputTypeStrict,
    public settings: Signal<FieldSettings>,
    // public properties: Signal<FieldProps>,
    // TODO: GET RID OF THIS as soon as we have a signal for the fieldProps
    public fieldsSettingsService: FieldsSettingsService
  ) { }
}