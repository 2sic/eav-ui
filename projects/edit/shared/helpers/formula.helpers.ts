import { LocalizationHelpers } from '.';
import { FieldValue } from '../../../edit-types';
import { FormulaContext, FormulaFunction, FormulaType } from '../models';
import { EavEntity } from '../models/eav';

export class FormulaHelpers {

  static getFormulaValue(
    type: FormulaType,
    context: FormulaContext,
    currentLanguage: string,
    defaultLanguage: string,
    formulaItems: EavEntity[],
    propagateError: boolean,
  ): FieldValue {
    const formulaItem = formulaItems.find(item => {
      const target: string = LocalizationHelpers.translate(currentLanguage, defaultLanguage, item.Attributes.Target, null);
      return target === type;
    });
    if (formulaItem == null) { return; }

    const formula: string = LocalizationHelpers.translate(currentLanguage, defaultLanguage, formulaItem.Attributes.Formula, null);
    if (formula == null) { return; }

    try {
      const formulaFn = this.buildFormulaFunction(formula);
      const calculatedValue = formulaFn(context);
      return calculatedValue;
    } catch (error) {
      if (propagateError) {
        throw error;
      }
      console.error(`Error while calculating formula "${type}" for field "${context.field.name}"`, error);
    }
  }

  private static buildFormulaFunction(formula: string): FormulaFunction {
    let cleanFormula = formula.trim();

    // V1 cleanup
    if (cleanFormula.startsWith('v1')) {
      cleanFormula = cleanFormula.replace('v1', 'function');
    } else if (cleanFormula.startsWith('V1')) {
      cleanFormula = cleanFormula.replace('V1', 'function');
    }
    const formulaFn: FormulaFunction = new Function('return ' + cleanFormula)();
    return formulaFn;
  }
}
