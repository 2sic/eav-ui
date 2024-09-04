import { FormulaVersions, requiredFormulaPrefix, FormulaVersion, FormulaFunction } from '../formula-definitions';

/**
 * Contains methods for building formulas.
 */

export class FormulaSourceCodeHelper {
  /**
   * Used to clean formula text.
   * @param formula Formula text to clean
   * @returns Cleaned formula text
   */
  static #cleanFormula(formula: string): string {
    if (!formula)
      return formula;

    // Clean and remove any leading single-line comments
    let cleanFormula = formula.trim();
    if (cleanFormula.startsWith('//'))
      cleanFormula = cleanFormula.replace(/^\/\/.*\n/gm, '').trim();

    /*
      Valid function string:
      function NAME (...ARGS) { BODY }
 
      Must build function string for these inputs:
      v1 (...ARGS) { BODY }
      function v1 (...ARGS) { BODY }
      v2((...ARGS) => { BODY });
 
      Everything else is ignored.
      TODO: do this properly with regex if it's not too slow
    */
    if (cleanFormula.startsWith(FormulaVersions.V1))
      return `${requiredFormulaPrefix}${cleanFormula}`;

    if (cleanFormula.startsWith(`${requiredFormulaPrefix}${FormulaVersions.V1}`))
      return cleanFormula;

    if (cleanFormula.startsWith('v2(')) {
      cleanFormula = cleanFormula.substring(3, cleanFormula.lastIndexOf('}') + 1);
      cleanFormula = cleanFormula.replace('=>', '');
      return `${requiredFormulaPrefix}v2 ${cleanFormula}`;
    }

    return cleanFormula;
  }

  /**
   * Used to find formula version.
   * @param formula Formula text
   * @returns If formula is V1 or V2
   */
  static findFormulaVersion(formula: string): FormulaVersion {
    const cleanFormula = this.#cleanFormula(formula);
    const versionPart = cleanFormula.substring(requiredFormulaPrefix.length, cleanFormula.indexOf('(')).trim();
    const validVersions = Object.values(FormulaVersions);

    return (validVersions).includes(versionPart as FormulaVersion)
      ? versionPart as FormulaVersion
      : undefined;
  }

  /**
   * Used to build executable formula function from formula text.
   * @param formula Formula text
   * @returns Executable formula function
   */
  static buildFormulaFunction(formula: string): FormulaFunction {
    const cleanFormula = this.#cleanFormula(formula);
    const fn: FormulaFunction = new Function(`return ${cleanFormula}`)();
    return fn;
  }
}
