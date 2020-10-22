import { FormGroup } from '@angular/forms';
import { FormValues } from '../../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { FieldFormulas } from '../../helpers/formula.models';
import { LocalizationHelper } from '../../helpers/localization-helper';
import { EavAttributes } from '../../models/eav';
import { FormulaContext, FormulaFunction } from './item.models';

export function runValueFormulas(
  attributes: EavAttributes,
  form: FormGroup,
  lang: string,
  defaultLang: string,
  formulas: FieldFormulas,
) {
  if (formulas == null) { return; }

  for (const [fieldName, formula] of Object.entries(formulas)) {
    const disabled = form.controls[fieldName].disabled;
    if (disabled) { return; }

    const cleanFormula = cleanFormulaVersions(formula);
    const formulaFn: FormulaFunction = new Function('return ' + cleanFormula)();

    const fieldValues = LocalizationHelper.getBestValue(attributes[fieldName], lang, defaultLang);
    const context: FormulaContext = {
      data: {
        name: fieldName,
        value: fieldValues.value,
        form: getFormValues(form),
      }
    };
    const newValue = formulaFn(context);
    fieldValues.value = newValue;
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

/** Gets form values from controls because form.value getter doesn't return disabled fields */
function getFormValues(form: FormGroup) {
  const formValues: FormValues = {};

  for (const [name, control] of Object.entries(form.controls)) {
    formValues[name] = control.value;
  }

  return formValues;
}
