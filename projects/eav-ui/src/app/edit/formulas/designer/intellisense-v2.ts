import { FieldOption } from '../../dialog/footer/formula-designer/formula-designer.models';
import { PickerItem } from '../../fields/picker/models/picker-item.model';
import { FormulaCacheItem } from '../cache/formula-cache.model';
import { FormulaVersions } from '../formula-definitions';
import { FormulaPropsParameters } from '../formula-run-one-helpers.factory';
import { FormulaV1Context } from '../run/formula-run-context.model';
import { FormulaV1Data } from '../run/formula-run-data.model';
import { FormulaV1Experimental } from '../run/formula-run-experimental.model';

// Import the type definitions for intellisense
import editorTypesForIntellisense from './editor-intellisense-function-v2.rawts';

export class IntellisenseV2 {
  /**
   * Used to build the formula typings for use in intellisense.
   * @param formula
   * @param fieldOptions
   * @param itemHeader
   * @returns Formula typings for use in intellisense
   */
  static getTypings(formula: FormulaCacheItem, fieldOptions: FieldOption[], prefill: Record<string, unknown>): string {
    switch (formula.version) {
      case FormulaVersions.V2: {
        const formulaPropsParameters = new FormulaPropsParameters(prefill).all;

        const allFields = fieldOptions.map(f => `${f.fieldName}: ${this.#inputTypeToDataType(f.inputType)};`).join('\n');
        const allParameters = Object.keys(formulaPropsParameters).map(key => `${key}: any;`).join('\n');
        const final = editorTypesForIntellisense
          .replace('/* [inject:AllFields] */', allFields)
          .replace('/* [inject:AllParameters] */', allParameters);

        return final;

        // TODO: probably update the entity-type info which was added in v14.07.05
      }
      default:
        return;
    }
  }

  static #inputTypeToDataType(inputType: string) {
    const lower = inputType.toLowerCase();
    if (lower.startsWith('string')) return 'string';
    if (lower.startsWith('number')) return 'number';
    if (lower.startsWith('date')) return 'Date';
    if (lower.startsWith('boolean')) return 'boolean';
    return "any";
  }
}


interface FormulaPropsV1 {
  data: FormulaV1Data;
  context: FormulaV1Context;
  experimental: FormulaV1Experimental;
  item?: PickerItem; //@SDV possibly add PickerTreeItem also
}


