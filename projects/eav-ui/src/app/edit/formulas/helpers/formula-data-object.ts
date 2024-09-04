import { FieldHelper } from '../../shared/helpers';
import { FormulaTargets, SettingsFormulaPrefix, FormulaFieldValidation } from '../models/formula.models';
import { FormulaV1Data } from '../models/formula-run-data.model';
import { FormulaHelpers } from './formula.helpers';
import { FormulaObjectsInternalData } from './formula-objects-internal-data';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';

/**
 * The object containing data information.
 * Usually given to a formula on the first parameter.
 * eg v2((DATA, ctx) => { ... })
 */
export class FormulaDataObject implements FormulaV1Data {
  /** Private variable containing the data used in the getters */
  #propsData: FormulaObjectsInternalData;

  constructor(propsData: FormulaObjectsInternalData) {
    this.#propsData = propsData;
  }

  get default(): FieldValue {
    const { runParameters } = this.#propsData;
    const { formula, settingsInitial, inputTypeName } = runParameters;
    if (formula.target === FormulaTargets.Value)
      return FieldHelper.getDefaultOrPrefillValue(formula.fieldName, inputTypeName, settingsInitial);

    if (formula.target.startsWith(SettingsFormulaPrefix)) {
      const settingName = formula.target.substring(SettingsFormulaPrefix.length);
      return (settingsInitial as Record<string, any>)[settingName];
    }
  }

  get initial(): FieldValue {
    const definition = this.#propsData.runParameters.formula;
    if (definition.target !== FormulaTargets.Value)
      return;
    return this.#propsData.initialFormValues[definition.fieldName];
  }

  get parameters(): Record<string, any> {
    return FormulaHelpers.buildFormulaPropsParameters(this.#propsData.runParameters.itemHeader.ClientData?.parameters);
  }

  get prefill(): FieldValue {
    const { formula, settingsInitial, itemHeader: itemIdWithPrefill, inputTypeName } = this.#propsData.runParameters;
    if (formula.target !== FormulaTargets.Value) return;
    return FieldHelper.getDefaultOrPrefillValue(formula.fieldName, inputTypeName, settingsInitial, itemIdWithPrefill, true);
  }

  get value(): FieldValue {
    const { formula, settingsCurrent, currentValues: formValues } = this.#propsData.runParameters;
    if (formula.target === FormulaTargets.Value)
      return formValues[formula.fieldName];

    if (formula.target === FormulaTargets.Validation) {
      const formulaValidation: FormulaFieldValidation = {
        severity: '',
        message: '',
      };
      return formulaValidation as unknown as FieldValue;
    }

    if (formula.target.startsWith(SettingsFormulaPrefix)) {
      const settingName = formula.target.substring(SettingsFormulaPrefix.length);
      return (settingsCurrent as Record<string, any>)[settingName];
    }
  }
}
