import { FieldHelper } from '../../shared/helpers';
import { FormulaFieldValidation } from '../targets/formula-targets';
import { FormulaV1Data } from './formula-run-data.model';
import { FormulaHelpers } from '../formula.helpers';
import { FormulaExecutionSpecsWithRunParams } from './formula-objects-internal-data';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';

/**
 * The object containing data information.
 * Usually given to a formula on the first parameter.
 * eg v2((DATA, ctx) => { ... })
 */
export class FormulaDataObject implements FormulaV1Data {
  /** Private variable containing the data used in the getters */
  #propsData: FormulaExecutionSpecsWithRunParams;

  constructor(propsData: FormulaExecutionSpecsWithRunParams) {
    this.#propsData = propsData;
  }

  get default(): FieldValue {
    const { runParameters } = this.#propsData;
    const { formula, settingsInitial, inputTypeName } = runParameters;
    if (formula.isValue)
      return FieldHelper.getDefaultOrPrefillValue(formula.fieldName, inputTypeName, settingsInitial);

    if (formula.isSetting)
      return (settingsInitial as Record<string, any>)[formula.settingName];
  }

  get initial(): FieldValue {
    const definition = this.#propsData.runParameters.formula;
    if (!definition.isValue)
      return;
    return this.#propsData.initialFormValues[definition.fieldName];
  }

  get parameters(): Record<string, any> {
    return FormulaHelpers.buildFormulaPropsParameters(this.#propsData.runParameters.itemHeader.ClientData?.parameters);
  }

  get prefill(): FieldValue {
    const { formula, settingsInitial, itemHeader, inputTypeName } = this.#propsData.runParameters;
    if (!formula.isValue) return;
    return FieldHelper.getDefaultOrPrefillValue(formula.fieldName, inputTypeName, settingsInitial, itemHeader, true);
  }

  get value(): FieldValue {
    const { formula, settingsCurrent, currentValues: formValues } = this.#propsData.runParameters;
    if (formula.isValue)
      return formValues[formula.fieldName];

    if (formula.isValidation) {
      const formulaValidation: FormulaFieldValidation = {
        severity: '',
        message: '',
      };
      return formulaValidation as unknown as FieldValue;
    }

    if (formula.isSetting)
      return (settingsCurrent as Record<string, any>)[formula.settingName];
  }
}
