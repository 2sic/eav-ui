import { Signal } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Of } from '../../../../../../core';
import { CustomJsonEditor, FieldSettings, Number } from '../../../../../../edit-types';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { AdamControl } from '../../fields/basic/hyperlink-library/hyperlink-library.models';
import { convertValueToArray } from '../../fields/picker/picker.helpers';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { ItemFieldVisibility } from '../../state/item-field-visibility';


/** Slightly enhanced standard Abstract Control with additional warnings */
export interface AbstractControlPro extends AbstractControl {
  _warning$?: BehaviorSubject<ValidationErrors>;
}

/** Validators here are copied from https://github.com/angular/angular/blob/master/packages/forms/src/validators.ts */
export class ValidationHelpers {

  static isRequired(settings: FieldSettings): boolean {
    // hidden field can't be required
    return this.#shouldIgnoreValidators(settings) ? false : settings.Required;
  }

  public static getValidators(specs: ValidationHelperSpecs, inputType: Of<typeof InputTypeCatalog>): ValidatorFn[] {
    // TODO: merge all validators in a single function? Should be faster
    const validators: ValidatorFn[] = [
      inputType !== InputTypeCatalog.HyperlinkLibrary
        ? this.#required(specs)
        : this.#requiredAdam(specs),
      this.#regEx(specs),
      this.#decimals(specs),
      this.#numberMin(specs),
      this.#numberMax(specs),
      this.#listMin(specs),
      this.#listMax(specs),
      this.#formulaValidate(specs),
    ];
    if (inputType === InputTypeCatalog.CustomJsonEditor)
      validators.push(this.#jsonValidator(specs));
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

  static #ensureWarningsAndGetSettingsIfNoIgnore(control: AbstractControl, specs: ValidationHelperSpecs): FieldSettings {
    this.ensureWarning(control);
    const settings = specs.settings();
    if (this.#shouldIgnoreValidators(settings)) return null;
    return settings;
  }

  static #required(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const s = this.#ensureWarningsAndGetSettingsIfNoIgnore(control, specs);
      if (s == null || !s.valueRequired) return null;
      return Validators.required(control);
    };
  }

  static #requiredAdam(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const s = this.#ensureWarningsAndGetSettingsIfNoIgnore(control, specs);
      if (s == null || !s.valueRequired) return null;

      return (control as AdamControl).adamItems === 0 ? { required: true } : null;
    };
  }

  static #regEx(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const s = this.#ensureWarningsAndGetSettingsIfNoIgnore(control, specs);
      if (s == null || !s.ValidationRegExJavaScript) return null;

      return Validators.pattern(s.ValidationRegExJavaScript)(control);
    };
  }

  static #decimals(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const s = this.#ensureWarningsAndGetSettingsIfNoIgnore(control, specs) as FieldSettings & Number;
      if (s?.Decimals == null || s.Decimals < 0) return null;
      if (control.value == null) return null;

      const matchString = s.Decimals === 0 ? `^-?[0-9]+$` : `^-?[0-9]+(\.[0-9]{1,${s.Decimals}})?$`;
      const matches = (control.value as number).toString().match(matchString);
      return !matches ? { decimals: true } : null;
    };
  }

  static #numberMin(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const s = this.#ensureWarningsAndGetSettingsIfNoIgnore(control, specs) as FieldSettings & Number;
      if (s?.Min == null) return null;

      return Validators.min(s.Min)(control);
    };
  }

  static #numberMax(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const s = this.#ensureWarningsAndGetSettingsIfNoIgnore(control, specs) as FieldSettings & Number;
      if (s?.Max == null) return null;

      return Validators.max(s.Max)(control);
    };
  }

  static #listMin(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const s = this.#ensureWarningsAndGetSettingsIfNoIgnore(control, specs);
      if (s == null || s.AllowMultiMin == 0 || s.AllowMultiMin == undefined) return null;
      return countValues(control, s) < s.AllowMultiMin ? { minNoItems: s.AllowMultiMin } : null;
    };
  }

  static #listMax(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const s = this.#ensureWarningsAndGetSettingsIfNoIgnore(control, specs);
      if (s == null || s.AllowMultiMax == 0 || s.AllowMultiMax == undefined) return null;
      return countValues(control, s) > s.AllowMultiMax ? { maxNoItems: s.AllowMultiMax } : null;
    };
  }

  static #jsonValidator(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControlPro): ValidationErrors | null => {
      this.ensureWarning(control);
      const settings = specs.settings();
      let error: boolean;
      let warning: boolean;
      const jsonMode = (settings as FieldSettings & CustomJsonEditor).JsonValidation;

      if (this.#shouldIgnoreValidators(settings) || jsonMode === 'none' || !control.value) {
        error = false;
        warning = false;
      } else {
        try {
          JSON.parse(control.value);
          error = false;
          warning = false;
        } catch {
          if (jsonMode === 'strict') {
            error = true;
            warning = false;
          } else if (jsonMode === 'light') {
            error = false;
            warning = true;
          }
        }
      }

      control._warning$.next(warning ? { jsonWarning: true } : null);
      return error ? { jsonError: true } : null;
    };
  }

  static #formulaValidate(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControlPro): ValidationErrors | null => {
      this.ensureWarning(control);
      const fieldProps = specs.fieldsSettingsService.fieldProps[specs.fieldName]();
      const formulaValidation = fieldProps.formulaValidation;

      const { error, warning } = (() => {
        if (this.#shouldIgnoreValidators(specs.settings()) || formulaValidation == null)
          return { error: false, warning: false };
        if (formulaValidation.severity === 'error')
          return { error: true, warning: false };
        if (formulaValidation.severity === 'warning')
          return { error: false, warning: true };
        return { error: false, warning: false };
      })();

      control._warning$.next(warning ? { formulaWarning: true, formulaMessage: formulaValidation.message } : null);
      return error ? { formulaError: true, formulaMessage: formulaValidation.message } : null;
    };
  }

  /** Hidden fields can't have validators */
  static #shouldIgnoreValidators(settings: FieldSettings): boolean {
    return !ItemFieldVisibility.mergedVisible(settings);
  }
}

function countValues(control: AbstractControl, s: FieldSettings): number {
  return Array.isArray(control.value)
    ? control.value.length
    : convertValueToArray(control.value, s.Separator, s._options).length;
}


export class ValidationHelperSpecs {
  constructor(
    public fieldName: string,
    public inputType: Of<typeof InputTypeCatalog>,
    public settings: Signal<FieldSettings>,
    // public properties: Signal<FieldProps>,
    // TODO: GET RID OF THIS as soon as we have a signal for the fieldProps
    public fieldsSettingsService: FieldsSettingsService
  ) { }
}