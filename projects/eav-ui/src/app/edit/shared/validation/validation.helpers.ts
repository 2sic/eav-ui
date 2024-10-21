import { Signal } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CustomJsonEditor } from 'projects/edit-types/src/FieldSettings-CustomJsonEditor';
import { FieldSettingsNumber } from 'projects/edit-types/src/FieldSettings-Number';
import { FieldSettingsPicker } from 'projects/edit-types/src/FieldSettings-Pickers';
import { BehaviorSubject } from 'rxjs';
import { Of } from '../../../../../../core';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { FieldSettingsOptionsWip, FieldSettingsSharedSeparator } from '../../../../../../edit-types/src/FieldSettings-Pickers';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { AdamControl } from '../../fields/basic/hyperlink-library/hyperlink-library.models';
import { PickerData } from '../../fields/picker/picker-data';
import { convertValueToArray } from '../../fields/picker/picker.helpers';
import { FieldProps } from '../../state/fields-configs.model';
import { ItemFieldVisibility } from '../../state/item-field-visibility';


/** Slightly enhanced standard Abstract Control with additional warnings */
export interface AbstractControlPro extends AbstractControl {
  // TODO: NO SUBJECT necessary, just make a simple property
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
    control._warning$ ??= new BehaviorSubject<ValidationErrors>(null);
  }

  static #ensureWarningsAndGetSettingsIfNoIgnore(control: AbstractControl, specs: ValidationHelperSpecs) {
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
      const s = this.#ensureWarningsAndGetSettingsIfNoIgnore(control, specs);
      if (s?.Decimals == null || s.Decimals < 0) return null;
      if (control.value == null) return null;

      const matchString = s.Decimals === 0 ? `^-?[0-9]+$` : `^-?[0-9]+(\.[0-9]{1,${s.Decimals}})?$`;
      const matches = (control.value as number).toString().match(matchString);
      return !matches ? { decimals: true } : null;
    };
  }

  static #numberMin(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const s = this.#ensureWarningsAndGetSettingsIfNoIgnore(control, specs);
      if (s?.Min == null) return null;

      return Validators.min(s.Min)(control);
    };
  }

  static #numberMax(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const s = this.#ensureWarningsAndGetSettingsIfNoIgnore(control, specs);
      if (s?.Max == null) return null;

      return Validators.max(s.Max)(control);
    };
  }

  static #listMin(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const s = this.#ensureWarningsAndGetSettingsIfNoIgnore(control, specs);
      if (s == null || s.AllowMultiMin == 0 || s.AllowMultiMin == undefined) return null;
      return countValues(control, specs, s) < s.AllowMultiMin ? { minNoItems: s.AllowMultiMin } : null;
    };
  }

  static #listMax(specs: ValidationHelperSpecs): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const s = this.#ensureWarningsAndGetSettingsIfNoIgnore(control, specs);
      if (s == null || s.AllowMultiMax == 0 || s.AllowMultiMax == undefined) return null;
      return countValues(control, specs, s) > s.AllowMultiMax ? { maxNoItems: s.AllowMultiMax } : null;
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
      const formulaValidation = specs.props().formulaValidation;

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

function countValues(control: AbstractControl, specs: ValidationHelperSpecs, s: FieldSettings & FieldSettingsOptionsWip & FieldSettingsSharedSeparator): number {
  // If it is an array, return the length right away, since we don't need additional processing
  if (Array.isArray(control.value))
    return control.value.length;

  // Picker Data - can be null in the first few cycles since it may not yet be initialized
  const pd = specs.pickerData;
  if (pd == null)
    return convertValueToArray(control.value, s.Separator, false).length;

  // TODO: probably replace with just the pd.Selected...() to get the count
  // const options = pd.optionsAll() ?? [];
  // const allowEmptyNew = pickerItemsAllowsEmpty(options);
  const allowEmpty = s._allowSelectingEmpty;
  const allowEmptyFromPd = pd.optionsAllowsEmpty();
  console.log('2dm countValues', { value: control.value, allowEmpty, allowEmptyFromPd });
  const length = convertValueToArray(control.value, s.Separator, allowEmpty).length;
  return length;
}


export class ValidationHelperSpecs {
  constructor(
    /** The Field Name */
    public fieldName: string,
    /** The Input Type */
    public inputType: Of<typeof InputTypeCatalog>,
    /** The settings, but must be re-cast so the system knows it has more properties */
    settings: Signal<FieldSettings>,
    /** The field properties an updated on every formula cycle */
    public props: Signal<FieldProps>,
    /** Delayed get pickers data */
    private pickersGet: () => Record<string, PickerData>,
  ) {
    this.settings = settings as Signal<FieldSettings & FieldSettingsSharedSeparator & CustomJsonEditor & FieldSettingsNumber & FieldSettingsPicker & FieldSettingsOptionsWip>;
  }

  /** The settings cast in a way that it should have all relevant properties */
  settings: Signal<FieldSettings & FieldSettingsSharedSeparator & CustomJsonEditor & FieldSettingsNumber & FieldSettingsPicker & FieldSettingsOptionsWip>;

  /** Get the pickers for this field */
  get pickerData(): PickerData {
    return this.pickersGet()?.[this.fieldName] ?? null;
  }
}