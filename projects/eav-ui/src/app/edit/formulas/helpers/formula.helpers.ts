import { FieldOption } from '../../dialog/footer/formula-designer/formula-designer.models';

// Import the type definitions for intellisense
import editorTypesForIntellisense from '!raw-loader!../editor-intellisense-function-v2.rawts';
import { formV1Prefix, requiredFormulaPrefix } from '../formula.constants';
// tslint:disable-next-line: max-line-length
import { FormulaCacheItem, FormulaFunction, FormulaProps, FormulaPropsV1, FormulaVersion, FormulaVersions } from '../models/formula.models';
import { FormulaDataObject } from './formula-data-object';
import { FormulaObjectsInternalData } from './formula-objects-internal-data';
import { FormulaContextObject } from './formula-context-object';
import { FormulaExperimentalObject } from './formula-experimental-object';

/**
 * Contains methods for building formulas.
 */
export class FormulaHelpers {

  /**
   * Used to clean formula text.
   * @param formula Formula text to clean
   * @returns Cleaned formula text
   */
  private static cleanFormula(formula: string): string {
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

    if (cleanFormula.startsWith(formV1Prefix))
      return `${requiredFormulaPrefix}${cleanFormula}`;
    
    if (cleanFormula.startsWith(`${requiredFormulaPrefix}${formV1Prefix}`))
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
    const cleanFormula = this.cleanFormula(formula);
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
    const cleanFormula = this.cleanFormula(formula);
    const fn: FormulaFunction = new Function(`return ${cleanFormula}`)();
    return fn;
  }

  /**
   * Used to build formula props parameters.
   * @returns Formula properties
   */
  static buildFormulaProps(propsData: FormulaObjectsInternalData,): FormulaProps {
    const { formula, formValues } = propsData.runParameters;
    
    switch (formula.version) {
      case FormulaVersions.V1:
      case FormulaVersions.V2:

        // Create the data object and add all value properties of the form to it
        const data = Object.assign(new FormulaDataObject(propsData), formValues);

        const context = new FormulaContextObject(propsData);

        const experimental = new FormulaExperimentalObject(propsData);

        return {
          data,
          context,
          experimental,
        } satisfies FormulaPropsV1;
      default:
        return;
    }
  }

  /**
   * Used to build the formula props parameters as a record of key-value pairs.
   * @param prefillAsParameters
   * @returns
   */
  static buildFormulaPropsParameters(prefillAsParameters: Record<string, unknown>): Record<string, any> {
    return prefillAsParameters ? JSON.parse(JSON.stringify(prefillAsParameters)) : {};
  }


  /**
   * Used to build the formula typings for use in intellisense.
   * @param formula
   * @param fieldOptions
   * @param itemHeader
   * @returns Formula typings for use in intellisense
   */
  static buildFormulaTypings(formula: FormulaCacheItem, fieldOptions: FieldOption[], prefillAsParameters: Record<string, unknown>): string {
    switch (formula.version) {
      case FormulaVersions.V2: {
        const formulaPropsParameters = this.buildFormulaPropsParameters(prefillAsParameters);

        // debugger;

        const allFields = fieldOptions.map(f => `${f.fieldName}: ${this.inputTypeToDataType(f.inputType)};`).join('\n');
        const allParameters = Object.keys(formulaPropsParameters).map(key => `${key}: any;`).join('\n');
        const final = editorTypesForIntellisense
          .replace('/* [inject:AllFields] */', allFields)
          .replace('/* [inject:AllParameters] */', allParameters);

        // console.error('test 2dm', final);
        return final;

        // TODO: probably update the entity-type info which was added in v14.07.05
      }
      default:
        return;
    }
  }
  private static inputTypeToDataType(inputType: string) {
    const lower = inputType.toLowerCase();
    if (lower.startsWith('string')) return 'string';
    if (lower.startsWith('number')) return 'number';
    if (lower.startsWith('date')) return 'Date';
    if (lower.startsWith('boolean')) return 'boolean';
    return "any";
  }
}


