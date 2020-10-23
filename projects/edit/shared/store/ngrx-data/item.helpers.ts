import { FormValues } from '../../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { FieldFormulas } from '../../helpers/formula.models';
import { LocalizationHelper } from '../../helpers/localization-helper';
import { EavAttributes } from '../../models/eav';
import { FormulaContext, FormulaFunction } from './item.models';

export function runValueFormulas(attributes: EavAttributes, lang: string, defaultLang: string, formulas: FieldFormulas) {
  if (formulas == null) { return; }

  for (const [fieldName, formula] of Object.entries(formulas)) {
    const cleanFormula = cleanFormulaVersions(formula);
    const formulaFn: FormulaFunction = new Function('return ' + cleanFormula)();

    const eavValue = LocalizationHelper.getBestValue(attributes[fieldName], lang, defaultLang);
    const context: FormulaContext = {
      data: {
        name: fieldName,
        value: eavValue.value,
        form: getFormValues(attributes, lang, defaultLang),
      }
    };
    const newValue = formulaFn(context);
    eavValue.value = newValue;
  }
}

function cleanFormulaVersions(formula: string) {
  let cleanFormula = formula.trim();

  // V1 cleanup
  if (cleanFormula.startsWith('v1') || cleanFormula.startsWith('V1')) {
    if (cleanFormula.startsWith('v1')) {
      cleanFormula = cleanFormula.replace('v1', 'function');
    }
    if (cleanFormula.startsWith('V1')) {
      cleanFormula = cleanFormula.replace('V1', 'function');
    }
  }

  return cleanFormula;
}

function getFormValues(attributes: EavAttributes, lang: string, defaultLang: string) {
  const formValues: FormValues = {};

  for (const [name, attribute] of Object.entries(attributes)) {
    formValues[name] = LocalizationHelper.translate(lang, defaultLang, attribute, null);
  }

  return formValues;
}
