import { FieldValue } from 'projects/edit-types';
import { InputFieldHelpers } from '../../shared/helpers';
import { FormulaV1Data, FormulaTargets, SettingsFormulaPrefix, FormulaFieldValidation } from '../models/formula.models';
import { FormulaHelpers } from './formula.helpers';
import { FormulaObjectsInternalData } from './formula-objects-internal-data';

export class FormulaDataObject implements FormulaV1Data {
  /** Private variable containing the data used in the getters */
  #propsData: FormulaObjectsInternalData;

  constructor(propsData: FormulaObjectsInternalData) {
    this.#propsData = propsData;
  }

  get default(): FieldValue {
    const { runParameters, inputType } = this.#propsData;
    const { formula, settingsInitial } = runParameters;
    if (formula.target === FormulaTargets.Value)
      return InputFieldHelpers.parseDefaultValue(formula.fieldName, inputType, settingsInitial);

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
    return FormulaHelpers.buildFormulaPropsParameters(this.#propsData.runParameters.itemIdWithPrefill.ClientData?.parameters);
  }

  get prefill(): FieldValue {
    const { formula, settingsInitial, itemIdWithPrefill } = this.#propsData.runParameters;
    const { inputType } = this.#propsData;
    if (formula.target !== FormulaTargets.Value) { return; }
    return InputFieldHelpers.parseDefaultValue(formula.fieldName, inputType, settingsInitial, itemIdWithPrefill, true);
  }

  get value(): FieldValue {
    const { formula, settingsCurrent, formValues } = this.#propsData.runParameters;
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
