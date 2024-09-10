import { FieldHelper } from '../../shared/helpers';
import { FormulaFieldValidation } from '../targets/formula-targets';
import { FormulaV1Data } from './formula-run-data.model';
import { FormulaHelpers } from '../formula.helpers';
import { FormulaExecutionSpecsWithRunParams, FormulaRunParameters } from './formula-objects-internal-data';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { PickerItem } from 'projects/edit-types';

/**
 * The object containing data information.
 * Usually given to a formula on the first parameter.
 * eg v2((DATA, ctx) => { ... })
 */
export class FormulaDataObject implements FormulaV1Data {
  /** Private variable containing the data used in the getters */
  #propsData: FormulaExecutionSpecsWithRunParams;
  #params: FormulaRunParameters;

  constructor(propsData: FormulaExecutionSpecsWithRunParams) {
    this.#propsData = propsData;
    this.#params = propsData.runParameters;
  }

  get default(): FieldValue {
    const { formula, settingsInitial, inputTypeName } = this.#params;
    if (formula.isValue)
      return FieldHelper.getDefaultOrPrefillValue(formula.fieldName, inputTypeName, settingsInitial);

    if (formula.isSetting)
      return (settingsInitial as Record<string, any>)[formula.settingName];

    if (formula.isNewPicker)
      return this.#params.pickerOptions as unknown as FieldValue;
  }

  get initial(): FieldValue {
    const formula = this.#params.formula;
    if (!formula.isValue)
      return;
    return this.#propsData.initialFormValues[formula.fieldName];
  }

  get parameters(): Record<string, any> {
    return FormulaHelpers.buildFormulaPropsParameters(this.#params.itemHeader.ClientData?.parameters);
  }

  get prefill(): FieldValue {
    const { formula, settingsInitial, itemHeader, inputTypeName } = this.#params;
    if (!formula.isValue) return;
    return FieldHelper.getDefaultOrPrefillValue(formula.fieldName, inputTypeName, settingsInitial, itemHeader, true);
  }

  get value(): FieldValue {
    const { formula } = this.#params;
    if (formula.isValue)
      return this.#params.currentValues[formula.fieldName];

    if (formula.isValidation) {
      const formulaValidation: FormulaFieldValidation = {
        severity: '',
        message: '',
      };
      return formulaValidation as unknown as FieldValue;
    }

    if (formula.isSetting)
      return (this.#params.settingsCurrent as Record<string, any>)[formula.settingName];

    if (formula.isNewPicker)
      return this.#params.pickerRaw as unknown as FieldValue;
  }

  get options(): PickerItem[] {
    return this.#params.pickerOptions;
  }

  get optionsRaw(): PickerItem[] {
    return this.#params.pickerRaw;
  }
}
