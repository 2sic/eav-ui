
import { FormulaVersions } from './formula-definitions';
import { FormulaDataObject } from './run/formula-run-data';
import { FormulaExecutionSpecsWithRunParams } from './run/formula-objects-internal-data';
import { FormulaContextObject } from './run/formula-run-context';
import { FormulaExperimentalObject } from './run/formula-experimental-object';
import { FormulaV1Data } from './run/formula-run-data.model';
import { FormulaV1Context } from './run/formula-run-context.model';
import { FormulaV1Experimental } from './run/formula-run-experimental.model';
import { PickerItem } from '../fields/picker/models/picker-item.model';

export class FormulaHelpers {
  /**
   * Used to build formula props parameters.
   * @returns Formula properties
   */
  static buildFormulaProps(propsData: FormulaExecutionSpecsWithRunParams,): FormulaPropsV1 {
    const { formula, currentValues: formValues } = propsData.runParameters;
    
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
        // default should never happen, so don't return any data to use; will probably error if this happens
        // 2024-09-10 2dm adding throw error here to see if it's anywhere
        // TODO: REMOVE option default everywhere ca. 2024-Q3
        throw new Error(`Formula version unknown not supported`);
        // return;
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

}



export interface FormulaPropsV1 {
  data: FormulaV1Data;
  context: FormulaV1Context;
  experimental: FormulaV1Experimental;
  item?: PickerItem; //@SDV possibly add PickerTreeItem also
}


