import { FieldHelper } from '../../shared/helpers';
import { FormulaFieldValidation } from '../targets/formula-targets';
import { FormulaV1Data } from './formula-run-data.model';
import { FormulaRunOneHelpersFactory } from '../formula-run-one-helpers.factory';
import { FormulaExecutionSpecsWithRunParams, FormulaRunParameters } from './formula-objects-internal-data';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { PickerItem } from '../../fields/picker/models/picker-item.model';
import { StateUiMapperBase } from '../../fields/picker/adapters/state-ui-mapper-base';

/**
 * The object containing data information.
 * Usually given to a formula on the first parameter.
 * eg v2((DATA, ctx) => { ... })
 */
export class FormulaDataObject implements FormulaV1Data {
  /** Private variable containing the data used in the getters */
  #propsData: FormulaExecutionSpecsWithRunParams;
  #params: FormulaRunParameters;
  #valueMapper: StateUiMapperBase;

  constructor(propsData: FormulaExecutionSpecsWithRunParams) {
    this.#propsData = propsData;
    this.#params = propsData.runParameters;
    this.#valueMapper = this.#params.pickerInfo.mapper;
  }

  get default(): FieldValue {
    const { formula, settingsInitial } = this.#params;
    if (formula.isValue)
      return this.#value(FieldHelper.getDefaultOrPrefillValue(formula.fieldName, formula.inputType.inputType, settingsInitial));

    if (formula.isSetting)
      return (settingsInitial as Record<string, any>)[formula.settingName];

    if (formula.isNewPicker)
      return this.#params.pickerInfo.options.list as unknown as FieldValue;
  }

  get initial(): FieldValue {
    const formula = this.#params.formula;
    return formula.isValue
      ? this.#value(this.#propsData.initialFormValues[formula.fieldName])
      : null;
  }

  get parameters(): Record<string, any> {
    return FormulaRunOneHelpersFactory.buildFormulaPropsParameters(this.#params.itemHeader.ClientData?.parameters);
  }

  get prefill(): FieldValue {
    const { formula, settingsInitial, itemHeader } = this.#params;
    return formula.isValue
      ? this.#value(FieldHelper.getDefaultOrPrefillValue(formula.fieldName, formula.inputType.inputType, settingsInitial, itemHeader, true))
      : null;
  }

  get value(): FieldValue | FormulaFieldValidation {
    const formula = this.#params.formula;

    if (formula.isValue)
      return this.#value(this.#params.currentValues[formula.fieldName]);

    if (formula.isSetting)
      return (this.#params.settingsCurrent as Record<string, any>)[formula.settingName];

    if (formula.isValidation)
      return {
        severity: '',
        message: '',
      } satisfies FormulaFieldValidation;
  }

  /** Get the selected data - make sure it's a copy of each item, so changes don't affect the source! */
  get selected(): PickerItem[] { return this.#getSelected('list'); }

  get selectedRaw(): PickerItem[] { return this.#getSelected('listRaw'); }

  #getSelected(part: 'list' | 'listRaw') {
    const list = this.#params.pickerInfo.selected[part];
    return this.#params.pickerInfo.picker.selectedCopy(list);
  }

  get options(): PickerItem[] {
    return this.#getOptions('list');
    // return this.#params.pickerInfo.options.list;
  }

  get optionsRaw(): PickerItem[] {
    return this.#getOptions('listRaw');
    // return this.#params.pickerInfo.options.listRaw;
  }

  #getOptions(part: 'list' | 'listRaw') {
    const list = this.#params.pickerInfo.options[part];
    return list; // return this.#params.pickerInfo.picker.selectedCopy(list);
  }


  #value(raw: FieldValue): FieldValue {
    return this.#valueMapper?.toUi(raw) ?? raw;
  }
}
