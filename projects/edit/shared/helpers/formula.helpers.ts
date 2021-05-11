import { FormulaFunction } from '../models';

export class FormulaHelpers {

  static buildFormulaFunction(formula: string): FormulaFunction {
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
