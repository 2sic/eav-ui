import { FormulaFieldValidation } from '../targets/formula-targets';
import { FormulaV1Data } from './formula-run-data.model';
import { FormulaExecutionSpecsWithRunParams, FormulaRunParameters, FormulaRunPickers } from './formula-objects-internal-data';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { PickerItem } from '../../fields/picker/models/picker-item.model';
import { StateUiMapperBase } from '../../fields/picker/adapters/state-ui-mapper-base';
import { FieldSettings } from 'projects/edit-types';

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
  #picker: FormulaRunPickers;

  constructor(propsData: FormulaExecutionSpecsWithRunParams) {
    this.#propsData = propsData;
    this.#params = propsData.runParameters;
    this.#picker = this.#params.pickerHelper.infos;
    this.#valueMapper = this.#params.pickerHelper.infos.mapper;
  }

  get default(): FieldValue {
    const { formula } = this.#params;
    if (formula.isValue)
      return this.#value(this.#params.defaultValueHelper().getDefaultOrPrefillValue());

    if (formula.isSetting)
      return (this.#params.settingsInitial)[formula.settingName as keyof FieldSettings] as FieldValue;

    if (formula.isNewPicker)
      return this.#picker.options.list as unknown as FieldValue;
  }

  get initial(): FieldValue {
    const formula = this.#params.formula;
    return formula.isValue
      ? this.#value(this.#propsData.initialFormValues[formula.fieldName])
      : null;
  }

  get parameters(): Record<string, any> {
    return this.#propsData.parameters.all();
  }

  get prefill(): FieldValue {
    const { formula } = this.#params;
    return formula.isValue
      ? this.#value(this.#params.defaultValueHelper().getDefaultOrPrefillValue(true))
      : null;
  }

  get value(): FieldValue | FormulaFieldValidation {
    const formula = this.#params.formula;

    if (formula.isValue)
      return this.#value(this.#params.currentValues[formula.fieldName]);

    if (formula.isSetting)
      return (this.#params.settingsCurrent)[formula.settingName as keyof FieldSettings] as FieldValue;

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
    const list = this.#picker.selected[part];
    return this.#picker.picker.selectedCopy(list);
  }

  get options(): PickerItem[] {
    return this.#getOptions('list');
  }

  get optionsRaw(): PickerItem[] {
    return this.#getOptions('listRaw');
  }

  #getOptions(part: 'list' | 'listRaw') {
    // TODO: create copy!
    const list = this.#picker.options[part];
    return list;
  }


  #value(raw: FieldValue): FieldValue {
    return this.#valueMapper?.toUi(raw) ?? raw;
  }
}
