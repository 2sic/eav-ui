import { FieldCalculations, FormValue } from '../../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { EavAttributes } from '../../models/eav';
import { FieldFormulas, FormulaContext } from './item.models';

export function runValueCalculations(attributes: EavAttributes, fieldCalculations: FieldCalculations, langKey: string) {
  const formulas = findValueFormulas(fieldCalculations, langKey);
  Object.entries(formulas).forEach(([fieldName, formula]) => {
    const fieldValues = attributes[fieldName].values.find(
      value => !!value.dimensions.find(dimension => dimension.value === langKey || dimension.value === '*'),
    );
    const formulaFn: (context: FormulaContext) => FormValue = new Function('return ' + formula)();
    fieldValues.value = formulaFn({ fieldName, fieldValue: fieldValues.value, allValues: attributes });
  });
}

function findValueFormulas(calculations: FieldCalculations, langKey: string) {
  const formulas: FieldFormulas = {};
  Object.entries(calculations).forEach(([fieldName, calcItems]) => {
    const valueCalcItems = calcItems.filter(
      calcItem =>
        calcItem.attributes.Target.values.find(value =>
          !!value.dimensions.find(dimension => dimension.value === langKey || dimension.value === '*'),
        )?.value === 'value',
    );
    const allValueFormulas = valueCalcItems.map(calcItem => calcItem.attributes.Formula);
    const langFiltered = allValueFormulas.find(f =>
      f.values.find(value => !!value.dimensions.find(dimension => dimension.value === langKey || dimension.value === '*')),
    );
    if (langFiltered == null) { return; }
    formulas[fieldName] = langFiltered.values[0].value;
  });
  return formulas;
}
